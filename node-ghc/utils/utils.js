


export default {
  authorizationBond : function authorizationBond(userInfo){
    if(userInfo){
      return "Bearer " + userInfo.access_token;
    }
    return "";
  }


}




