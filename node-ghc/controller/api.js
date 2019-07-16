
var url = require("url");
const utils = require('../utils/utils')
const httpUtilPromisify = require("../utils/httpUtilPromisify");


class Api {
  async invokeApi(req, res, next) {
    //  /pay/billManage/queryBillManageList
    if(req.session == null || !req.session.isLogin){
      res.status(500).send(utils.errorObj());
      res.end();
      return;
    }
    var post = '';
    req.on('data',function(data){
      post += data;
    });

    req.on('end', async function(){
      var query = JSON.parse(post);
      var realPathName = url.parse(req.url).pathname;
      try {
        let rtn = await httpUtilPromisify.postAndReturnJson(realPathName, query, utils.authorizationIsLogin(req),req.session.userInfo.access_token);
        var json = JSON.parse(rtn);
        res.status(json.status);
        res.send(rtn);
        res.end();
      } catch (error) {
        console.error(realPathName);
        console.error(error);
        res.status(500).send(error);
        res.end();
      }
    })
  }
}

module.exports = new Api();