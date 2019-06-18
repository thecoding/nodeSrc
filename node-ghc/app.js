
var express = require("express");
var http = require("http");
var session = require("express-session");
var httpUtil = require("./utils/httpUtil");
var scheduleTask = require("./schedule/refreshToken");
var redis = require('redis');  
var RedisStore = require('connect-redis')(session);
var url = require("url");

// 创建express客户端
const app = express();

// 创建Redis客户端
var redisClient = redis.createClient(6379, '192.168.1.250', {auth_pass: 'zxwlpt',db: 8});


// session管理
// ticket续期
// 导入透传
// excel附件生成
// 多线程请求

// 不用redis方式
// app.use(session({
//   secret: "ghc node",
//   cookie: {maxAge:  1000 * 60 },
//   rolling: true,
// }));

// 设置 Express 的 Session 存储中间件 用redis存储
app.use(session({  
  store:new RedisStore({client: redisClient}),
  secret: 'ghc_secret',
  resave: false,
  saveUninitialized: false
}))



// 测试
app.use(function (req, res, next) {  
  if (!req.session) {
    return next(new Error('error'))
  }
  next()
})



app.all('*', (req, res, next) => {
  const { origin, Origin, referer, Referer } = req.headers;
  const allowOrigin = origin || Origin || referer || Referer || '*';
	res.header("Access-Control-Allow-Origin", allowOrigin);
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", 'Express');
	if (req.method == 'OPTIONS') {
  	res.sendStatus(200);
	} else {
    next();
	}
});




var options = {
    host:'192.168.2.181',
    port:'8021',
    path:'/auth/oauth/token',
    method:'POST',
}

//登陆请求单独处理
//导出请求单独处理
//其他添加签名，转发
//签名


// {"access_token":"2fcadc65-9368-4414-bc3d-60d2d84c1bbd","token_type":"bearer","refresh_token":"90abb796-6371-44d7-bc50-0fcaae7ced66","expires_in":22520,"scope":"server","license":"yangliu"}

//续期
app.get("/",function(req,res,next){
  // if(req.session.isLogin){
  //   //后台失效时间 小于 session 失效时间
  //   if(req.session.expires_in < session.cookie.maxAge){
  //     //续期
  //   }
  // }else{
    next();
  // }
})



//登陆
app.get("/login",function(req,res){

  if (req.session.isLogin) {//检查用户是否已经登录
    res.send(res.session);
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
    
    //请求方式一
    // httpUtil.post("192.168.2.181","8021","/auth/oauth/token",contents,"text/html","application/x-www-form-urlencoded",function(data){
    //   console.info(data);
    // });
   
    //请求方式二
    httpUtil.postAndReturnHtml("http://192.168.2.181:8021/auth/oauth/token",contents,function(data){
      //设置session
      req.session.isLogin = true;
      req.session.userInfo = data;

      console.info(data);

      res.send(data);
      res.end();
    },function(error){
      res.send(error);
      res.end();
    });
  }
});


//退出登陆
app.get("/loginOut",function(req,res){
  
  httpUtil.postAndReturnJson("http://192.168.2.181:8021/oauth/removeToken","",function(data){
    console.info(data);
  });

  req.session.cookie.maxAge=0;
  // req.session.destroy();
  res.send("退出登陆成功");
});



//请求转发
app.get("/api/*",function(req,res){
  var urlPath  = url.parse(req.url);
  var realPathName = "";
  if(urlPath.pathname.startsWith("/api/")){
    realPathName = urlPath.pathname.substr(4,urlPath.pathname.length);
  }
  var contents = {
    "_PAGE_NUMBER" : 1,
    "_PAGE_SIZE": 50
  }
  //  /pay/billManage/queryBillManageList
  httpUtil.postAndReturnJson("http://192.168.2.181:8021" + realPathName,contents,function(data){
    res.send(data);
    res.end();
  })
});

app.get("*",function(req,res){
  res.send("请求不正确");
  res.end;
});



var server = app.listen(8882,"127.0.0.1",function(){
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
});

//定时刷新token
// scheduleTask.refreshToken();

