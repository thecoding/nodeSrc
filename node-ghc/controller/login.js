

const httpUtilPromisify = require("../utils/httpUtilPromisify.js");
const utils = require('../utils/utils');
var querystring = require('querystring');

class LoginHandle {

  //登陆
  doLogin(req, res, next) {
    // 定义了一个post变量，用于暂存请求体的信息
    var post = '';     
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function(chunk){    
        post += chunk;
    });
    req.on('end', async function(){
      if (req.session && req.session.isLogin && req.session.userInfo) {//检查用户是否已经登录
        res.end(utils.contentToRes({
          access_token: req.session.userInfo.access_token,
          license: req.session.userInfo.license
        }));
        return;
      } 
      post = querystring.parse(post);
      if(post.username == undefined){
        res.status(403).end(utils.error403("没有username参数"));
        return;
      }
      if(post.password == undefined){
        res.status(403).end(utils.error403("没有password参数"));
        return;
      }
      //登陆请求
      var contents = {
        username: post.username,
        // username: "admin",
        password: post.password,
        // password: "ODkxMjM0NTYyOXt6eH0=",
        client_id: 'paycenter',
        client_secret: 'paycenter',
        Scope: 'server',
        grant_type: 'password',
        sign: ''
      };

      try {
        var rtn = await httpUtilPromisify.postAndReturnHtml("/auth/oauth/token", contents, "");
        var json = JSON.parse(rtn);
        req.session.isLogin = true;
        req.session.userInfo = json.content;
        console.info(rtn);
        res.status(json.status);
        res.send(utils.contentToRes({
          access_token: json.content.access_token,
          license: json.content.license
        }));
      } catch (error) {
        console.error(error);
        res.status(500).send(utils.error500());
      }
      res.end();
    });
  }
  //退出登陆
  async loginOut(req,res,next){
    try {
      if(req.session && req.session.userInfo){
        try {
          let rtn = await httpUtilPromisify.postAndReturnJson("/auth/oauth/logout","",utils.authorizationIsLogin(req),req.session.userInfo.access_token);  
          console.info(rtn);
          req.session.destroy();
          var json = JSON.parse(rtn);
          res.status(json.status);
          res.send(rtn);
        } catch (error) {
          console.info(error);
          res.status(500).send(utils.error500());
        } 
      }
      res.end();
    } catch (error) {
      console.error(error);
      res.end(error);
    }
    

    // httpUtil.postAndReturnJson(options.host+":"+options.port+"/oauth/removeToken", "",utils.authorizationBond(req), function (data) {
    //   console.info(data);
    //   req.session.destroy();
    //   res.send("退出登陆成功");
    //   res.end();
    // });
  }

  test(req,res,next){
    res.end("ok");
  }
}

module.exports =  new LoginHandle()
