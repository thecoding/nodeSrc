
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
var scheduleTask = require("./schedule/refreshToken");
var RedisStore = require('connect-redis')(session);

var httpUtil = require("./utils/httpUtil");
var utils = require("./utils/utils");
//引入multer模块  
var multer = require ('multer');
//uuid工具可以生成唯一标示 需要安装
var UUID = require('uuid');

var path = require('path');


//中台续传
const fs = require('fs')
// const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')
const router = require('./routes/index')
const multipart = require('connect-multiparty');
var multipartMiddleware = multipart()
//中台续传



require("date-utils");

//文件上传-----star
//设置保存规则
var storage = multer.diskStorage({
  //destination：字段设置上传路径，可以为函数
  destination: path.join(__dirname, 'temp'),

  //filename：设置文件保存的文件名
  filename: function(req, file, cb) {
      let extName = file.originalname.slice(file.originalname.lastIndexOf('.'))
      let fileName = UUID.v1()
      cb(null, fileName + extName)
  }
});
//设置过滤规则（可选）
var imageFilter = function(req, file, cb){
    var acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    //微信公众号只接收上述四种类型的图片
    if(acceptableMime.indexOf(file.mimetype) !== -1){
        cb(null, true)
    }else{
        cb(null, false)
    }
}
//设置限制（可选）
var imageLimit = {
  fieldSize: '2MB'
}

//创建 multer 实例
var imageUploader = multer({ 
  storage: storage,
  // fileFilter: imageFilter,
  // limits: imageLimit
}).array('logo', 12)    //定义表单字段、数量限制

//文件上传-----end





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

app.get("/test1",function(req,res){
  res.set({'Content-Type': 'text/plain;charset=utf-8'});
  res.end("中文 !!");
});

app.post("*", function (req, res,next) {
  
  console.log(new Date().toFormat("YYYY-MM-DD HH24:MI:SS")+ " request请求："+req.path);
  res.set({'Content-Type': 'text/plain;charset=utf-8'});
  if(req.path == '/favicon.ico'){
    res.end();
    return;
  }
  // console.info("sessionId: "+ req.sessionID);
  if(req.path != '/admin/login' && (req.session == null || !req.session.isLogin)){
    res.status(401).send(utils.error401());
    res.end();
    return;
  }else{
    next();
  }
});



app.post("/upload-array",imageUploader,function(req,res,next){
  console.log(req.file);  
  console.log(req.body); 
  res.end("上传成功"); 
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

  // const { path: filePath, originalFilename } = req.files.file
  // const newPath = path.join(path.dirname(filePath), originalFilename)

  // fs.rename(filePath, newPath, function (err) {
  //     if (err) {
  //         return;
  //     }
  //     else {
  //         const file = fs.createReadStream(newPath)
  //         const form = new FormData();
  //         const authorization = utils.authorizationIsLogin(req);
  //         form.append('file', file)

  //         fetch(options.host+':'+options.port+"/base/sysAttach/doUpload", {
  //             method: "POST",
  //             body: form,
  //             // form.getHeaders()
  //             headers: {
  //               'Authorization': authorization,
  //             }  
  //         }).then(res => res.json()).then(data => {
  //           res.send({data:data}); //将上传结果返回给前端
  //         });
  //     }
  // })
  // res.json({})
});
//中台续传


/// 查询图片接口
// http://127.0.0.1:8021/base/sysAttach/doQuery  查询的 {"flowIds":"1"}   逗号隔开


//刷新token
app.get("/refresh",function(req,res){
  var contents = {
    client_id: 'paycenter',
    client_secret: 'paycenter',
    Scope: 'server',
    grant_type: 'refresh_token',
    refresh_token: req.session.userInfo.refresh_token,
    sign: ''
  };
  httpUtil.postAndReturnHtml(options.host+":"+options.port+"/auth/oauth/token", contents,utils.authorizationIsLogin(req), function (data) {
    res.send(data);
    res.end();
  });
});







router(app);


app.use('/static',express.static(path.join(__dirname, './public')));

// app.all('/', function(req, res){
//     console.log("=======================================");
//     console.log("请求路径："+req.url);
//     var filename = req.url.split('/')[req.url.split('/').length-1];
//     var suffix = req.url.split('.')[req.url.split('.').length-1];
//     console.log("文件名：", filename);
//     if(req.url==='/'){
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.end(get_file_content(path.join(__dirname, 'html', 'index.html')));
//     }else if(suffix==='css'){
//         res.writeHead(200, {'Content-Type': 'text/css'});
//         res.end(get_file_content(path.join(__dirname, 'public', 'css', filename)));
//     }else if(suffix in ['gif', 'jpeg', 'jpg', 'png']) {
//         res.writeHead(200, {'Content-Type': 'image/'+suffix});
//         res.end(get_file_content(path.join(__dirname, 'public', 'images', filename)));
//     }else if(suffix === 'xlsx'){
//         res.writeHead(200, {"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}); //xlsx 文件制定类型);
//         res.end(get_file_content(path.join(__dirname, 'public', 'xlsx', filename)));
//     }
// });

// function get_file_content(filepath){
//   return fs.readFileSync(filepath);
// }

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
// scheduleTask.refreshToken();

