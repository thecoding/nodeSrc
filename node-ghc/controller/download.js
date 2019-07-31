

var xlsx = require('node-xlsx');
var StringUtils = require('../utils/stringUtils.js');
var url = require('url');
var utils = require('../utils/utils.js');
var httpUtilPromisify = require('../utils/httpUtilPromisify.js');
var poolUtil = require('../thread/threadPool');
var querystring = require('querystring');
var threadTest = require('../thread/threadTest.js');
var fs = require('fs');
var stream = require('stream');

var path = require('path');

var workerThreadsPool = require('../thread/workerThreadsPool.js');
var workerThreadsPool2 = require('../thread/workerThreadsPool2.js');

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
      // var queryParam = querystring.parse(post);
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

      queryParam._SEARCH_COUNT = 1;//有这个参数，就会返回total\size\current\hasNext\pages

      // queryParam.excelKeys = req.query.excelKeys; 这是get请求获取参数
      if(queryParam.excelKeys == undefined){
        res.status(403).send(utils.error403("没有excelKeys参数")).end();
        return;
      }
      queryParam._PAGE_NUMBER = 1;
      queryParam._PAGE_SIZE = 2;

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
        try {
          console.info(error);
          var json = JSON.parse(error);
          res.status(json.status).send(error);
          res.end();
        } catch (error) {
          res.status(500).send(utils.error500());
          res.end();
        }
        return;
      }

      //session 中放置 是否下载完的标志
      // req.session.userInfo.isDownload = false; //是否下载完
      // workerThreadsPool({});//todo 
      // res.status(200).send(utils.contentToRes("正在下载。。。"));
      // res.end();


      

      var totalPage = Math.ceil(total/queryParam._PAGE_SIZE);  
      var lastData;
      // lastData = new Array();
      // if(totalPage>1){
      //   for(var i=0;i<10;i++){
      //     var _PAGE_NUMBER = 2;
      //     try {
      //       _PAGE_NUMBER = i + _PAGE_NUMBER;
      //       queryParam._PAGE_NUMBER = _PAGE_NUMBER;
      //       var rtnData = await httpUtilPromisify.postAndReturnJson(requestUrl, queryParam, utils.authorizationIsLogin(req),req.session.userInfo.access_token);
      //       lastData.push(rtnData);
      //     } catch (error) {
      //       console.info(error); 
      //     } 
      //   }
      // }
      // var firstArr = new Array();
      // firstArr.push(JSON.stringify(firstData));
      // lastData.push(firstData);

      var attr = {
        num: totalPage - 1,
        page: 2,
        url: requestUrl,
        body: queryParam,
        authorization: utils.authorizationIsLogin(req),
        accessToken: req.session.userInfo.access_token
      }
      if(totalPage>1){
        try {
          var rtnData = await workerThreadsPool(attr);  
          if(rtnData.length>0){
            lastData = rtnData;
          }else{
            lastData = new Array();
          }
          
          // const httpUtil = require('../utils/httpUtil.js');
          // const httpConfig = require('../config/config.js');

          // const {num,page,url,body,authorization,accessToken} = attr;

          // httpUtil.postAndReturnJson(httpConfig.host + ":"+httpConfig.port+url,body,authorization,accessToken,function(data){
          //   console.log(data);
          // });  
        } catch (error) {
          console.info(error);
        }
      }
      lastData.push(JSON.parse(firstData));
      
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
        var items;
        if(typeof json === 'string'){
          items = JSON.parse(json).content.records;
        }else if(typeof json === 'object'){
          items = json.content.records;
        }else{
          console.error('数据格式不正确');
          continue;
        }
        for(var i=0;i<items.length;i++){
          var item = items[i];
          var oneRow = new Array();
          for(let key in keys){
            var name = keys[key];
            var str = item[name];
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

      // res.setHeader('Content-Type', 'text/event-stream');
      // res.setHeader('Cache-Control', 'no-cache');
      // res.write(buffer);



      // 创建一个bufferstream
      // var bufferStream = new stream.PassThrough();
      // //将Buffer写入
      // bufferStream.end(buffer);
      // //进一步使用
      // bufferStream.pipe(res);
    })
  }
  /**
   * 导出，先生成文件，这种情况是导出文件会比较大，第一次请求过来的时候，先返回正确的响应
   * @param {request} req 
   * @param {response} res 
   */
  createExcelFile(req,res){
    var realPathName = url.parse(req.url).pathname;
    var requestUrl = ""; //数据请求地址
    if(realPathName.length >= 6){
      requestUrl = realPathName.replace('/excel2','');
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
      //校验参数:  requestUrl 导出数据请求uri 
      // queryParam : 
      // fileName 文件名 (不必填)
      // excelKeys 取数字段 (必填)
      // excelLables 表头字段 (不必填)

      // var queryParam = querystring.parse(post); // post 参数获取
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
      // queryParam.excelKeys = req.query.excelKeys; 这是get请求获取参数
      if(queryParam.excelKeys == undefined){
        res.status(403).send(utils.error403("没有excelKeys参数")).end();
        return;
      }
      var attr = {
        url: requestUrl, //请求地址
        body: queryParam, //请求参数
        authorization: utils.authorizationIsLogin(req),
        accessToken: req.session.userInfo.access_token
      }

      //判断是否存在文件
      var sign = utils.getSign(url,queryParam,accessToken);
      var excelFile = path.join(__dirname,'/temp/'+sign+'.xlsx');
      attr.excelFile = excelFile;
      try {
        var isExisted = await isFileExisted(excelFile);
        if(StringUtils.isNotEmpty(isExisted)){
          req.session.userInfo.isDownload = false; //是否下载完
          req.session.userInfo.excelFile = excelFile;
          req.session.userInfo.fileName = fileName;
          req.session.userInfo.fileSign = sign;
          res.status(200).send(utils.contentToRes("正在下载。。。"));
          res.end();
          return;
        }
      } catch (error) {
        console.error(error);
      }

      // console.info(new Date().toFormat("YYYY-MM-DD HH24:MI:SS"));
      try {
        workerThreadsPool2(attr); //主线程运行，不用等返回  
      } catch (error) {
        console.log(error);
        req.session.userInfo.isDownload = false; //是否下载完
        req.session.userInfo.excelFile = excelFile;
        res.status(500).send(utils.error500("下载出错。。。"));
        res.end();
        return;
      }
      // console.info(new Date().toFormat("YYYY-MM-DD HH24:MI:SS"));

      //session 中放置 是否下载完的标志，并返回结果
      console.info(req.session.userInfo.isDownload);
      req.session.userInfo.isDownload = false; //是否下载完
      res.status(200).send(utils.contentToRes("正在下载。。。"));
      res.end();
      // var buffer = xlsx.build([{name: "mySheetName", data: excelData}]); // returns a buffer
      // res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
      // res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent(fileName)+".xlsx");
      // res.end(buffer, 'binary'); 
    });
  }
  //检查并且下载文件
  checkDownload(req,res){
    if(req.session.userInfo.isDownload == null || req.session.userInfo.isDownload == undefined || req.session.userInfo.isDownload){
      res.status(500).send(utils.error500("下载失败"));
      res.end();
      return;
    }
    var fileSign = req.session.userInfo.fileSign;
    var fileName = req.session.userInfo.fileName;
    var filePath = path.join(__dirname,'temp'); //temp文件夹
    var excelFile = path.join(filePath, fileSign+'.xlsx');
    if(fs.existsSync(excelFile)){
      var responseData = []; //文件流
      console.log("excelFile = "+ excelFile);
      var rs = fs.createReadStream(excelFile);
      rs.on('open', function (fd) {
        console.log('开始读取文件');
      });
      rs.on('data', function (chunk) {
        responseData.push(chunk);
      });
      
      rs.on('end', function () {
        console.log('读取文件结束')
        var finalData = Buffer.concat( responseData );
        res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
        res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent(fileName)+".xlsx");
        res.write( finalData );
        res.end();
      });
      rs.on('close', function () {
        console.log('文件关闭');
      });
      rs.on('error',function(err){
        res.status(500).send(utils.error500("下载失败"));
        res.end();
      });
    }else{
      res.status(500).send(utils.error500("文件不存在"));
      res.end();
    }
  }
}


function isFileExisted(fileName) {
  return new Promise(function(resolve, reject) {
      fs.access(fileName, (err) => {
          if (err) {
              reject(err.message);
          } else {
              resolve('existed');
          }
      })
  })
}

module.exports = new Download();