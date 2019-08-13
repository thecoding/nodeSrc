
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
const router = require('./routes/index')
var path = require('path');
const options = require('./config/config.js');
const redisOptions = options.redis;
require("date-utils");



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
  "sessionStore": redisOptions
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


// localhost:8882/test 测试是否启动服务 
app.get("/test",function(req,res){
  res.end("server is ok!!");
});


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

