
const fs = require('fs')
// const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')
var path = require('path');
var utils = require('../utils/utils');
const options = require('../config/config');


class FileUpload {

  // //中台续传
  upload(req,res,next){
    //   console.log(req.body, req.files);
    if(req.session == null || !req.session.isLogin){
      res.send({
        time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
        status: 500,
        errorCode: null,
        message: 'fail',
        contents: {info:"请登陆后再试"}
      });
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
      res.end({error: "没有找到图片"});
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
    var sign = utils.getSign("/base/sysAttach/doUpload",{},req.session.userInfo.access_token);
    fetch(options.host+':'+options.port+"/base/sysAttach/doUpload"+"?sign="+sign, {
        method: "POST",
        body: form,
        headers: headers
    }).then(res => res.json()).then(data => {
      res.send({data:data}); //将上传结果返回给前端
      res.end();
    });
  }
}

module.exports = new FileUpload();
