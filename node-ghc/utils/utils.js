


var utils = {
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
  }
}

module.exports = utils;



