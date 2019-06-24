


// * * * * * *
// ┬ ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │ |
// │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
// │ │ │ │ └───── month (1 - 12)
// │ │ │ └────────── day of month (1 - 31)
// │ │ └─────────────── hour (0 - 23)
// │ └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)



/**
 * 比如：token有效期是10分钟  redis刷新token是8分钟，redis中session保留时间是8分钟，session有效期比如5分钟，
 * session自动续期，到8分钟的时候自动刷新token有效期和保留时间，token有效期为10+，redis中的session保留时间为5分钟，
 * 如果session不操作有效期超过5分钟，自动失效，redis自动删除
 */

var httpUtilPromisify = require("../utils/httpUtilPromisify");
var httpUtil = require("../utils/httpUtil");
var redis = require("redis")


var options = {
  auth_pass : 'zxwlpt',
  db : 0
}
var redisClient = redis.createClient('6379','192.168.1.250',options);

const schedule = require("node-schedule");
const sessionTime = 60 * 5; /// session 保存时间 秒
const redisExpire = 60 * 8; /// redis中session 保留时间 秒

var scheduleTask = {
  refreshToken: function () {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *', () => {
      // console.log('scheduleCronstyle:' + new Date());
      refreshTokenAndSession();
      // getUserInfo();
    });
  }
};

async function getUserInfo(){
  await redisClient.get('sess:LPDp9b7d-wxvrz4ENM28q-hwa6U7LqPo',function(err,data){
    console.info(data);
  });
}

async function refreshTokenAndSession(){
  try {
    await redisClient.keys('sess:*', async (error, keyList) => {
      for(let key in keyList){
        console.info(keyList[key]);
        await redisClient.get(keyList[key], async (err, data) => {
          console.info(typeof keyList[key]);
          let rtn = refreshRequest(data,keyList[key]);//请求刷新
        });
      }
    });
  } catch (error) {
    console.info(error);
  }
}


async function refreshRequest(sessionData,key){
  console.info(sessionData);
  var sessionData = JSON.parse(sessionData);
  var contents = {
    client_id: 'paycenter',
    client_secret: 'paycenter',
    Scope: 'server',
    grant_type: 'refresh_token',
    refresh_token: sessionData.userInfo.refresh_token,
    sign: ''
  };
  try {
    let data = await httpUtilPromisify.postAndReturnHtml("/auth/oauth/token", contents, authorizationBond(sessionData.userInfo));  
    let rtn = JSON.parse(data).content;
    sessionData.userInfo = rtn;
    console.info(sessionData);
    try {
      await redisClient.set(key, JSON.stringify(sessionData),function(err,data){
        if(!err){
          redisClient.expire(key, sessionTime);
        }
      }); 
    } catch (error) {
      console.info(" test ")
      console.info(error);
    }
    console.log(sessionData.userInfo.access_token + " 刷新成功 ");
    return rtn;
  } catch (error) {
    console.log(sessionData.userInfo.access_token + " 刷新失败 ");
    return;
  }
}

function authorizationBond(userInfo){
  if(userInfo){
    return "Bearer " + userInfo.access_token;
  }
  return "";
}

async function refreshRedisToken(userInfo){
  var contents = {
    client_id: 'paycenter',
    client_secret: 'paycenter',
    Scope: 'server',
    grant_type: 'refresh_token',
    refresh_token: userInfo.refresh_token,
    sign: ''
  };
  var authorizationBond = "Bearer " + userInfo.access_token;
  httpUtil.postAndReturnHtml("http://192.168.2.181:8021/auth/oauth/token", contents,authorizationBond, function (data) {
    res.send(data);
    res.end();
  });
}


/**
 * @desc 获取token
 * @return {Object}
 */
async function retrieveToken(req) {
  const { access_token, token_type, refresh_token, expires_in , scope, license } = typeof req.session.userinfo == 'string' ? JSON.parse(req.session.userinfo) : req.session.userinfo;
  try {
    await redisClient.keys('sess:*', async (error, keyList) => {
      for (let key in keyList) {
        key = keyList[key];
        let rtnkey = await redisClient.get(key, function(err, data) {
          var session_access_token  = typeof data == 'string' ? JSON.parse(JSON.parse(data).userinfo).access_token : data;
          if (access_token != session_access_token) {
            return "";
          } else {
            return key;
          }
        });
        if(rtnkey != ""){
          return rtnkey;
        }
      }
      return "-1";
    });
  } catch (err) {
    console.info(err)
  }
}

module.exports = scheduleTask;
