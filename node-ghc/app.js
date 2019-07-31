
//签名          完成 - utils.getSign
// session管理  完成 - redis管理
// ticket续期   完成 - scheduleTask
// 导入透传       
// excel附件生成


// 多线程请求


//登陆请求单独处理
//导出请求单独处理
//其他添加签名，转发
//签名
var express = require("express");
var session = require("express-session");
var RedisStore = require('connect-redis')(session);
var scheduleTask = require("./schedule/refreshToken");
var utils = require("./utils/utils");
require("date-utils");

// test start
var httpUtil = require("./utils/httpUtil");
//引入multer模块  
var multer = require ('multer');
//uuid工具可以生成唯一标示 需要安装
var UUID = require('uuid');
var path = require('path');
var threadTest = require('./thread/threadTest2.js')
var workerThreads = require('./thread/workerThreadsPool');

//中台续传
const fs = require('fs')
// const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')
const router = require('./routes/index')
const multipart = require('connect-multiparty');
var multipartMiddleware = multipart()
//中台续传
// test end 


// 创建express客户端
const app = express();

/// 设置 Express 的 Session 存储中间件 用redis存储
/// session 保留时间是 300秒 
// 测试改为 30000秒
var config = {
  "cookie": {
    "maxAge": 3000000,
    "secure": false
  },
  "sessionStore": {
    "host": "192.168.1.250",
    "port": "6379",
    "pass": "zxwlpt",
    "db": 0,
    "ttl": 30000, //单位秒
    "logErrors": true
  }
};

app.use(session({
  name: "sid", //// 可省略，默认就是sid
  secret: 'Asecret-', // 密钥示例，运行环境应至少使用128位随机字符串
  resave: false, //强制session保存到session store中 cookie之间的请求规则,假设每次登陆，就算会话存在也重新保存一次
  rolling: true, 
  saveUninitialized: true,
  cookie: config.cookie,
  store: new RedisStore(config.sessionStore)
}));


var options = {
  host: 'http://192.168.1.127',
  port: '8021',
  method: 'POST',
}

app.get("/test",function(req,res){
  res.end("server is ok!!");
});


// //文件下载测试
// app.get("/test2",function(req,res){
//   var fileName = "222";
//   var filePath = path.join(__dirname,'thread','temp');
//   var excelFile = path.join(filePath,'111.xlsx');
//   console.info("excelFile = "+excelFile);
//   if(fs.existsSync(excelFile)){
//     var responseData = []; //文件流
//     console.log("excelFile = "+ excelFile);
//     var rs = fs.createReadStream(excelFile);
//     rs.on('open', function (fd) {
//       console.log('开始读取文件');
//     });
//     rs.on('data', function (chunk) {
//       responseData.push(chunk);
//     });
    
//     rs.on('end', function () {
//       console.log('读取文件结束')
//       var finalData = Buffer.concat( responseData );
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
//       res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent(fileName)+".xlsx");
//       res.write( finalData );
//       res.end();
//     });
//     rs.on('close', function () {
//       console.log('文件关闭');
//     });
//     rs.on('error',function(err){
//       res.status(500).send(utils.error500("下载失败"));
//       res.end();
//     });
//   }else{
//     res.status(500).send(utils.error500("文件不存在"));
//     res.end();
//   }
// });




app.post("*", function (req, res,next) {
  
  console.log(new Date().toFormat("YYYY-MM-DD HH24:MI:SS")+ " request请求："+req.path);
  res.set({'Content-Type': 'text/plain;charset=utf-8'});
  if(req.path == '/favicon.ico'){
    res.end();
    return;
  }
  if(req.path != '/admin/login' && (req.session == null || !req.session.isLogin)){
    res.status(401).send(utils.error401());
    res.end();
    return;
  }else{
    next();
  }
});




//设置上传的目录，  
var upload = multer({ dest:  path.join(__dirname,'temp')});  

app.post("/upload-single",upload.single('logo'),function(req,res,next){
  console.log(req.file);  
  console.log(req.body); 
  res.end("上传成功"); 
});

//中台续传
app.post('/upload111', multipartMiddleware, function (req, res) {
  console.log(req.body, req.files);

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
});
//中台续传




//刷新token-test
// app.get("/refresh",function(req,res){
//   var contents = {
//     client_id: 'paycenter',
//     client_secret: 'paycenter',
//     Scope: 'server',
//     grant_type: 'refresh_token',
//     refresh_token: req.session.userInfo.refresh_token,
//     sign: ''
//   };
//   httpUtil.postAndReturnHtml(options.host+":"+options.port+"/auth/oauth/token", contents,utils.authorizationIsLogin(req), function (data) {
//     res.send(data);
//     res.end();
//   });
// });


router(app);

app.use('/static',express.static(path.join(__dirname, './public')));

app.get("*", function (req, res) {
  res.send("请求不正确");
  res.end;
});

var server = app.listen(8882, "0.0.0.0", function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
});

//定时刷新token
scheduleTask.refreshToken();

