

const httpUtilPromisify = require("../utils/httpUtilPromisify.js");
const utils = require('../utils/utils')

class LoginHandle {

  //登陆
  async doLogin(req, res, next) {
    if (req.session && req.session.isLogin) {//检查用户是否已经登录
      res.send(req.session);
    } else {
      // if(req.query.username){

      // }
      
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
        var s = await httpUtilPromisify.postAndReturnHtml("/auth/oauth/token", contents, "");
        req.session.isLogin = true;
        req.session.userInfo = JSON.parse(s).content;
        res.send(s);
      } catch (error) {
        console.error(error);
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
  }
  //退出登陆
  async loginOut(req,res,next){
    try {
      if(req.session && req.session.userInfo){
        let rtn = await httpUtilPromisify.postAndReturnJson("/auth/oauth/logout","",utils.authorizationIsLogin(req),req.session.userInfo.access_token);  
        console.info(rtn);
        req.session.destroy();
      }
      res.send("退出登陆成功");
    } catch (error) {
      console.error(error);
        res.send({
          time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
          status: 500,
          errorCode: null,
          message: 'fail',
          contents: {}
        });
    }
    res.end();
    

    // httpUtil.postAndReturnJson(options.host+":"+options.port+"/oauth/removeToken", "",utils.authorizationBond(req), function (data) {
    //   console.info(data);
    //   req.session.destroy();
    //   res.send("退出登陆成功");
    //   res.end();
    // });
  }
}

module.exports =  new LoginHandle()
