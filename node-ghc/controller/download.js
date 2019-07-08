

var xlsx = require('node-xlsx');
var StringUtils = require('../utils/stringUtils.js');
var url = require('url');
var utils = require('../utils/utils.js');
var httpUtilPromisify = require('../utils/httpUtilPromisify.js');

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
      res.end(utils.errorObj());
      return;
    }
    var queryParam = req.query;
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
    
    queryParam._PAGE_NUMBER = 1;
    queryParam._PAGE_SIZE = 10;
    
    // console.info(StringUtils.isEmpty(queryParam.params));
    var data = new Array(); //excel数据
    queryParam.excelLables = "车辆,用户名,身份证"
    var excelLables = StringUtils.isEmpty(queryParam.excelLables) ? new Array() : queryParam.excelLables.split(",");
    if(excelLables.length>0){
      data.push(excelLables); //表头
    }
    // console.info(excelLables);
    queryParam.excelKeys = 'billId,channelType,objId,objType,objTypeName,sendDate,sendFlag,sendFlagNamesmsContent,smsId,smsType';
    var json = '{"time":"2019-07-08 17:32:11","status":200,"errorCode":"","message":"SUCESS","content":{"count":10,"hasNext":false,"items":[{"billId":"19900005004","channelType":"APP","objId":"10414632","objType":"15","objTypeName":"异常信息","sendDate":"2019-07-06","sendFlag":"1","sendFlagName":"未读","smsContent":"管好车测试车队给您承运的订单10414632，添加异常信息","smsId":"1891417","smsType":"1"},{"billId":"19900005004","channelType":"APP","objId":"10414632","objType":"16","objTypeName":"时效罚款","sendDate":"2019-07-06","sendFlag":"1","sendFlagName":"未读","smsContent":"管好车测试车队给您承运的订单10414632，添加时效罚款","smsId":"1891400","smsType":"1"},{"billId":"19900005004","channelType":"APP","objId":"10414632","objType":"12","objTypeName":"指派订单","sendDate":"2019-07-06","sendFlag":"1","sendFlagName":"未读","smsContent":"管好车测试车队给您的车辆蜀Z05004指派了一个订单(订单号10414632)，请按要求完成订单。","smsId":"1890171","smsType":"1"},{"billId":"19900005004","channelType":"SMS","objId":"10409195","objType":"12","objTypeName":"指派订单","sendDate":"2019-07-04","sendFlag":"1","sendFlagName":"未读","smsContent":"自有司机04师傅，管好车测试车队给你指派了广州市-东莞市，07-05 12:00靠台的订单，请尽快下载登录管好车APP绑定银行卡收取运费，下载地址http://t.cn/ReyDIaO","smsId":"870112","smsType":"1"}],"numRows":4,"page":1,"totalNum":4}}';
    var items = JSON.parse(json).content.items;
    var keys = queryParam.excelKeys.split(",");
    var rowsData = new Array();
    for(var i=0;i<items.length;i++){
      var item = items[i];
      var oneRow = new Array();
      for(let key in keys){
        var str = item[keys[key]]
        oneRow.push(StringUtils.isEmpty(str) ? '' : str);
      }
      rowsData.push(oneRow);
    }
    console.info(rowsData);


    // try {
    //   let rtn = await httpUtilPromisify.postAndReturnJson(realPathName, queryParam.params, utils.authorizationIsLogin(req),req.session.userInfo.access_token);
    //   var jsonData = JSON.parse(rtn);
    //   //表第一行数据 
      

    //   if(jsonData.hasNext){
    //     //继续请求数据
    //   }
    //   var count = jsonData.totalNum ;
    //   res.send(rtn);
    // } catch (error) {
      
    // }
    // res.end();
    // var data = [[1,2,3],[true, false, null, 'sheetjs'],['foo','bar',new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
    var buffer = xlsx.build([{name: "mySheetName", data: rowsData}]); // returns a buffer
    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent(fileName)+".xlsx");
    res.end(buffer, 'binary'); 
  }
}

module.exports = new Download();