
const fs = require('fs')
// const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')
var path = require('path');
var utils = require('../utils/utils');
var url = require('url');
const options = require('../config/config');


class FileUpload {

  // //中台续传
  uploadImage(req,res,next){
    //   console.log(req.body, req.files);
    if(req.session == null || !req.session.isLogin){
      res.status(401).send(utils.error401());
      res.end();
      return;
    }
    var fileArr = new Array();
    let form = new FormData();
    var headers;
    if(req.files.file.length == undefined){
      fileArr.push(req.files.file);
    }else if(req.files.file.length>0){
      fileArr = req.files.file;
    }
    if(fileArr.length == 0){
      res.status(403).end(utils.error403("没有找到file图片"));
      return;
    }
    for(var i=0;i<fileArr.length;i++){
      const { path: filePath, originalFilename } = fileArr[i];
      const newPath = path.join(path.dirname(filePath), originalFilename);
      fs.renameSync(filePath,newPath);
      form.append('file', fs.createReadStream(newPath));
    }
    // headers = fileArr[0].headers;  //不需要设置
    headers = {};
    headers.Authorization =  utils.authorizationIsLogin(req);
    var sign = utils.getSign("/base/sysAttach/doUpload",query,req.session.userInfo.access_token);
    fetch(options.host+':'+options.port+"/base/sysAttach/doUpload"+"?sign="+sign, {
        method: "POST",
        body: form,
        headers: headers
    }).then(res => res.json()).then(data => {
      res.end({data:data}); //将上传结果返回给前端
    });
  }

  // //中台续传
  uploadFile(req,res,next){
    //   console.log(req.body, req.files);
    if(req.session == null || !req.session.isLogin){
      res.status(401).send(utils.error401());
      res.end();
      return;
    }

    var fileArr = new Array();
    let form = new FormData();
    var headers;
    if(req.files.file.length == undefined){
      fileArr.push(req.files.file);
    }else if(req.files.file.length>0){
      fileArr = req.files.file;
    }
    if(fileArr.length == 0){
      res.status(403).end(utils.error403("没有找到file图片"));
      return;
    }
    for(var i=0;i<fileArr.length;i++){
      const { path: filePath, originalFilename } = fileArr[i];
      const newPath = path.join(path.dirname(filePath), originalFilename);
      fs.renameSync(filePath,newPath);
      form.append('myFile', fs.createReadStream(newPath));
    }
    //参数
    var realPathName = url.parse(req.url).pathname;
    if(realPathName.length >= 5){
      realPathName = realPathName.replace('/file','');
    }
    var query = req.query;
    for(let p in query){
      var pValue = query[p];
      if(pValue != null && pValue !== ''){
        form.append(`${p}`,`${pValue}`);
      }
    }
    // headers = fileArr[0].headers;  //不需要设置
    headers = {};
    headers.Authorization =  utils.authorizationIsLogin(req);
    var sign = utils.getSign(realPathName,query,req.session.userInfo.access_token);
    fetch(options.host+':'+options.port+realPathName+"?sign="+sign, {
        method: "POST",
        body: form,
        headers: headers
    }).then(res => res.json()).then(data => {
      try {
        res.status(data.status);
        res.send(data);
        res.end(); //将上传结果返回给前端  
      } catch (error) {
        console.error(error);
        res.status(500).send(utils.error500());
        res.end();
      }
    });
  }
}

module.exports = new FileUpload();
