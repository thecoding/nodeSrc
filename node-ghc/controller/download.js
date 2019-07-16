

var xlsx = require('node-xlsx');
var StringUtils = require('../utils/stringUtils.js');
var url = require('url');
var utils = require('../utils/utils.js');
var httpUtilPromisify = require('../utils/httpUtilPromisify.js');
var poolUtil = require('../thread/threadPool');
var querystring = require('querystring');

class Download {

  /**
   * /excel
   * 多线程导出excel 1、导出数据处理 2、多线程处理
   * @param {*} req 
   * @param {*} res 
   */
  async excelDownload(req,res){
    var realPathName = url.parse(req.url).pathname;
    var requestUrl = ""; //数据请求地址
    if(realPathName.length >= 6){
      requestUrl = realPathName.replace('/excel','');
    }
    if(StringUtils.isEmpty(requestUrl)){
      res.status(500).send(utils.errorObj());
      res.end();
      return;
    }

    var post = '';
    req.on('data',function(data){
      post += data;
    });

    req.on('end',async function(){
      var queryParam = querystring.parse(post);
      var fileName = "导出列表"; //导出默认名字
      if(queryParam._PAGE_NUMBER != undefined){
        delete queryParam._PAGE_NUMBER;
      }
      if(queryParam._PAGE_SIZE != undefined){
        delete queryParam._PAGE_SIZE;
      }
      if(queryParam.fileName != undefined){
        fileName = queryParam.fileName;
      }

      queryParam._SEARCH_COUNT = 1;//有这个参数，就会返回total\size\current\hasNext\pages
      
      if(queryParam.excelKeys == undefined){
        res.status(403).send(utils.error403("没有excelKeys参数")).end();
        return;
      }
      queryParam._PAGE_NUMBER = 1;
      queryParam._PAGE_SIZE = 10;

      // console.info(StringUtils.isEmpty(queryParam.params));
      var excelData = new Array(); //excel数据
      // queryParam.excelLables = "车辆,用户名,身份证";
      var excelLables = StringUtils.isEmpty(queryParam.excelLables) ? new Array() : queryParam.excelLables.split(",");
      if(excelLables.length>0){
        excelData.push(excelLables); //表头
      }
      var excelKeys = queryParam.excelKeys;

      delete queryParam.excelKeys;
      delete queryParam.excelLables;

      var total = 0;
      var firstData;
      try {
        let rtn = await httpUtilPromisify.postAndReturnJson(requestUrl, queryParam, utils.authorizationIsLogin(req),req.session.userInfo.access_token);
        firstData = rtn;
        //表第一行数据 
        total = JSON.parse(rtn).content.total;
      } catch (error) {
        console.info(error);
        res.end(error);
        return;
      }
      var totalPage = Math.ceil(total/queryParam._PAGE_SIZE);  
      var lastData;
      if(totalPage>1){
        try {
          lastData = await poolUtil.getDownloadData(totalPage-1,2,requestUrl,queryParam,utils.authorizationIsLogin(req),req.session.userInfo.access_token);
          // console.info(lastData);  
          poolUtil.poolDestroy();
        } catch (error) {
          console.error(error);
          poolUtil.poolDestroy();
        }
      }else{
        lastData = new Array();
      }
      
      var firstArr = new Array();
      firstArr.push(JSON.stringify(firstData));
      lastData.push(firstData);


      //处理数据
      // console.info(excelLables);
      // queryParam.excelKeys = 'billId,channelType,objId,objType,objTypeName,sendDate,sendFlag,sendFlagNamesmsContent,smsId,smsType';

      var keys = excelKeys.split(","); //取的json key
      for(var j=0;j<lastData.length;j++){
        // var json = '{"time":"2019-07-08 17:32:11","status":200,"errorCode":"","message":"SUCESS","content":{"count":10,"hasNext":false,"items":[{"billId":"19900005004","channelType":"APP","objId":"10414632","objType":"15","objTypeName":"异常信息","sendDate":"2019-07-06","sendFlag":"1","sendFlagName":"未读","smsContent":"管好车测试车队给您承运的订单10414632，添加异常信息","smsId":"1891417","smsType":"1"},{"billId":"19900005004","channelType":"APP","objId":"10414632","objType":"16","objTypeName":"时效罚款","sendDate":"2019-07-06","sendFlag":"1","sendFlagName":"未读","smsContent":"管好车测试车队给您承运的订单10414632，添加时效罚款","smsId":"1891400","smsType":"1"},{"billId":"19900005004","channelType":"APP","objId":"10414632","objType":"12","objTypeName":"指派订单","sendDate":"2019-07-06","sendFlag":"1","sendFlagName":"未读","smsContent":"管好车测试车队给您的车辆蜀Z05004指派了一个订单(订单号10414632)，请按要求完成订单。","smsId":"1890171","smsType":"1"},{"billId":"19900005004","channelType":"SMS","objId":"10409195","objType":"12","objTypeName":"指派订单","sendDate":"2019-07-04","sendFlag":"1","sendFlagName":"未读","smsContent":"自有司机04师傅，管好车测试车队给你指派了广州市-东莞市，07-05 12:00靠台的订单，请尽快下载登录管好车APP绑定银行卡收取运费，下载地址http://t.cn/ReyDIaO","smsId":"870112","smsType":"1"}],"numRows":4,"page":1,"totalNum":4}}';
        if(lastData[j].length <= 0){
          continue;
        }
        var json = lastData[j];
        var items = JSON.parse(json).content.records;
        for(var i=0;i<items.length;i++){
          var item = items[i];
          var oneRow = new Array();
          for(let key in keys){
            var str = item[keys[key]]
            oneRow.push(StringUtils.isEmpty(str) ? '' : str);
          }
          excelData.push(oneRow);
        }
      }
      // res.end("请求成功");
      var buffer = xlsx.build([{name: "mySheetName", data: excelData}]); // returns a buffer
      res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
      res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent(fileName)+".xlsx");
      res.end(buffer, 'binary'); 
    })
  }
}

module.exports = new Download();