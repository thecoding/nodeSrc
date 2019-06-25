
// session管理  完成
// ticket续期   完成
// 导入透传       
// excel附件生成
// 多线程请求


//登陆请求单独处理
//导出请求单独处理
//其他添加签名，转发
//签名

var express = require("express");
var session = require("express-session");
var httpUtil = require("./utils/httpUtil");
var scheduleTask = require("./schedule/refreshToken");
var RedisStore = require('connect-redis')(session);
var url = require("url");
var utils = require("./utils/utils")

var httpUtilPromisify = require("./utils/httpUtilPromisify");

require("date-utils");


// 创建express客户端
const app = express();




/// 设置 Express 的 Session 存储中间件 用redis存储
/// session 保留时间是 300秒
var config = {
  "cookie": {
    "maxAge": 30000
  },
  "sessionStore": {
    "host": "192.168.1.250",
    "port": "6379",
    "pass": "zxwlpt",
    "db": 0,
    "ttl": 300, //单位秒
    "logErrors": true
  }
};

app.use(session({
  name: "sid", //// 可省略，默认就是sid
  secret: 'Asecret-', // 密钥示例，运行环境应至少使用128位随机字符串
  resave: true, // cookie之间的请求规则,假设每次登陆，就算会话存在也重新保存一次
  rolling: true, 
  saveUninitialized: false,
  cookie: config.cookie,
  store: new RedisStore(config.sessionStore)
}));


var options = {
  host: 'http://192.168.2.186',
  port: '8021',
  method: 'POST',
}


// {"access_token":"2fcadc65-9368-4414-bc3d-60d2d84c1bbd","token_type":"bearer","refresh_token":"90abb796-6371-44d7-bc50-0fcaae7ced66","expires_in":22520,"scope":"server","license":"yangliu"}

//登陆
app.get("/login", async function (req, res) {

  if (req.session.isLogin) {//检查用户是否已经登录
    res.send(req.session);

    // console.info(new Date().toFormat("YYYY-MM-DD HH24:MI:SS"));
    // console.info(new Date().addSeconds(600).toFormat("YYYY-MM-DD HH24:MI:SS"));

  } else {
    //登陆请求
    var contents = {
      // username: req.query.username,
      username: "admin",
      // password: req.query.password,
      password: "ODkxMjM0NTYyOXt6eH0=",
      client_id: 'paycenter',
      client_secret: 'paycenter',
      Scope: 'server',
      grant_type: 'password',
      sign: ''
    };
    
    try {
      var s = await httpUtilPromisify.postAndReturnHtml("/auth/oauth/token", contents,"");  
      req.session.isLogin = true;
      req.session.userInfo = JSON.parse(s).content;

      res.send(s);
    } catch (error) {
      res.send({
        time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
        status: 500,
        errorCode: null,
        message: 'fail',
        contents: {}
      });
    }
    res.end();
  }
});


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
  httpUtil.postAndReturnHtml(options.host+":"+options.port+"/auth/oauth/token", contents,utils.authorizationBond(req), function (data) {
    res.send(data);
    res.end();
  });
});


//退出登陆
app.get("/loginOut", function (req, res) {

  httpUtil.postAndReturnJson(options.host+":"+options.port+"/oauth/removeToken", "",utils.authorizationBond(req), function (data) {
    console.info(data);
    req.session.destroy();
    res.send("退出登陆成功");
    res.end();
  });
});




//请求转发
app.get("/api/*", async function (req, res) {
  var urlPath = url.parse(req.url);
  var realPathName = "";
  if (urlPath.pathname.startsWith("/api/")) {
    realPathName = urlPath.pathname.substr(4, urlPath.pathname.length);
  }
  var contents = {
    "_PAGE_NUMBER": 1,
    "_PAGE_SIZE": 10
  }

  //  /pay/billManage/queryBillManageList
  // httpUtil.postAndReturnJson(realPathName, contents,authorizationBond(req), function (data) {
  //   res.send(data);
  //   res.end();
  // })


  try {
    let rtn = await httpUtilPromisify.postAndReturnJson(realPathName,contents,utils.authorizationBond(req));  
    res.send(rtn);
  } catch (error) {
    res.send({
      time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
      status: 500,
      errorCode: null,
      message: 'fail',
      contents: {}
    });
  }
  res.end();
  
});



app.get("*", function (req, res) {
  res.send("请求不正确");
  res.end;
});



var server = app.listen(8882, "127.0.0.1", function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
});

//定时刷新token
scheduleTask.refreshToken();

