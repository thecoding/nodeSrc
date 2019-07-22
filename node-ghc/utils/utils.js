
var md5 = require('../lib/md5');
var StringUtils = require('./stringUtils');

var utils = {
  isLogin: function(req){
    return req.session != undefined && req.session.isLogin ? true : false;
  },
  authorizationBond : function authorizationBond(userInfo){
    if(userInfo){
      return "Bearer " + userInfo.access_token;
    }
    return "";
  },
  authorizationIsLogin : function authorizationIsLogin(req){
    if(req.session.isLogin){
      return "Bearer " + req.session.userInfo.access_token;
    }
    return "";
  },
  urlEncode : function (param, key, encode) {
    if (param == null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean' || param instanceof Array) {
        if (param !== "") {
            paramStr = key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
        }
    } else {
        var idx = 0;
        var paramArray = new Array();
        if (param.url != undefined) {
            if ((idx = param.url.indexOf("&")) > 0) {
                paramStr = param.url.substring(0, idx);
                var params = param.url.substring(idx + 1).split("&");
                for (var i in params) {
                    if (params[i].split("=")[1] !== "null" && params[i].split("=")[1] !== "") {
                        paramArray.push(params[i]);
                    }
                }
            } else {
                paramStr = param.url;
            }
        }
        if (param.data != undefined) {
            for (var i in param.data) {
                if (param.data[i] != null && param.data[i] !== "null" && param.data[i] !== "") {
                    paramArray.push(urlEncode(param.data[i], i, encode));
                }
            }
        }
        if (paramArray.length > 0)
            paramStr += "&" + paramArray.sort().join("&");
    }
    return paramStr;
  },
  getSign : function(url,param,accessToken){
    var newUrl = "";
    var value = "";
    let urlDeal = url.substring(1);
    if(param){
      for(let p in param){
        pValue = param[p];
        // console.info(p);
        // console.info(param[p]);
        if(pValue != null && pValue !== ''){
          newUrl += `${p}=${pValue}&`;
        }
      }
      // var newUrl = tranParam(param);
      let newArrayUrl = newUrl.split("&").sort().slice(1);
      value = urlDeal+(newArrayUrl.length>0?"?"+newArrayUrl.join("&"):'')+accessToken;
    }else{
      value = urlDeal + accessToken;
    }
    console.log("签名地址："+value);
    var sign = md5(value);
    console.log("签名为："+sign);
    return sign;
  },
  errorObj : function(content){
    var obj = {
        time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
        status: 500,
        errorCode: null,
        message: 'fail',
        content: null,
    }
    obj.error = StringUtils.isEmpty(content) ? "请求不正确" : content;
    return JSON.stringify(obj);
  },
  error403 : function(content){
    var obj = {
        time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
        status: 403,
        errorCode: null,
        message: 'fail',
        content: null,
    }
    obj.error = StringUtils.isEmpty(content) ? "请求参数不正确" : content;
    return JSON.stringify(obj);
  },
  error401 : function(){
    var obj = {
        time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
        status: 401,
        errorCode: null,
        message: 'fail',
        content: null,
    }
    obj.error =  "请登陆后再使用";
    return JSON.stringify(obj);
  },
  contentToRes: function(content){
    var obj = {
      time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
      status: 200,
      errorCode: null,
      message: 'fail',
      content: content
    }
    return JSON.stringify(obj);
  },
  error500 : function(content){
    var obj = {
        time: new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
        status: 500,
        errorCode: null,
        message: 'fail',
        content: null,
    }
    obj.error =  StringUtils.isEmpty(content) ? "服务器内部错误" : content;
    return JSON.stringify(obj);
  },
}
module.exports = utils;


// console.info(utils.getSign('/pay/payCenter/getAmount',{tenantId:0},'51792c20-d4b9-4f6d-aa55-591feb3ee019'));
// console.info(0 != null);

