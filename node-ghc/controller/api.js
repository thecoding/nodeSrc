
var url = require("url");
const utils = require('../utils/utils')
const httpUtilPromisify = require("../utils/httpUtilPromisify");


class Api {
  async invokeApi(req, res, next) {
    //  /pay/billManage/queryBillManageList
    if(req.session == null || !req.session.isLogin){
      res.send(utils.errorObj());
      res.end();
      return;
    }
    
    var realPathName = url.parse(req.url).pathname;

    try {
      let rtn = await httpUtilPromisify.postAndReturnJson(realPathName, req.query, utils.authorizationIsLogin(req),req.session.userInfo.access_token);
      res.send(rtn);
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

module.exports = new Api();