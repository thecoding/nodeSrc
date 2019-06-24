






async function doLogin(req,res,next){
  if (req.session.isLogin) {//检查用户是否已经登录
    res.send(req.session);
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
    //请求方式二
    httpUtil.postAndReturnHtml("http://192.168.2.181:8021/auth/oauth/token", contents,"", function (data) {
      //设置session
      req.session.isLogin = true;
      req.session.userInfo = JSON.parse(data).content;

      res.send(data);
      res.end();
    }, function (error) {
      res.send(error);
      res.end();
    });
  }
}

async function loginOut(){
  httpUtil.postAndReturnJson("http://192.168.2.181:8021/oauth/removeToken", "",authorizationBond(req), function (data) {
    console.info(data);
  });
  req.session.destroy();
  res.send("退出登陆成功");
}


function authorizationBond(req){
  if(req.session.isLogin){
    return "Bearer " + req.session.userInfo.access_token;
  }
  return "";
}