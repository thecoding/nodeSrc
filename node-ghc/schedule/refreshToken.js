


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
var redis = require("redis")
var utils = require("../utils/utils")
require('date-utils')


var options = {
  auth_pass : 'zxwlpt',
  db : 0
}

var redisClient = redis.createClient('6379','192.168.1.250',options);


const schedule = require("node-schedule");
const sessionTime = 60 * 5; /// session 保存时间 秒
const redisExpire = 60 * 8; /// redis中session 保留时间 秒
const expiresTime = 60 * 10; // 单位秒； session 中 expires_in值小于这个值就请求刷新，这个值不能小于task的循环间隔时间

var scheduleTask = {
  refreshToken: function () {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *', () => {
      if(redisClient.connected){
        refreshTokenAndSession();
      }else{
        console.info("连接失败")
      }
      console.info("处理完成" + new Date().toFormat("YYYY-MM-DD HH24:MI:SS"))
    });
  }
};

redisClient.on('error',function(error){
  console.log(error);
});



async function refreshTokenAndSession(){
  try {
    await redisClient.keys('sess:*', async (error, keyList) => {
      for(let key in keyList){
        await redisClient.get(keyList[key], async (err, data) => {
          // exprise_in 小于一个阀值的时候就去刷新
          var sessionData = JSON.parse(sessionData);
          if(sessionData.userInfo.expires_in && sessionData.userInfo.expires_in< expiresTime){
            let rtn = refreshRequest(data,keyList[key]);//请求刷新
          }          
        });
      }
    });
  } catch (error) {
    console.info(error);
  }
}


/***
 * 刷新请求、重新设置redis中session值、设置expire有效时间
 */
async function refreshRequest(sessionData,key){
  // console.info(sessionData);
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
    let data = await httpUtilPromisify.postAndReturnHtml("/auth/oauth/token", contents, utils.authorizationBond(sessionData.userInfo));  
    let rtn = JSON.parse(data).content;
    sessionData.userInfo = rtn;
    // console.info(sessionData);
    try {
      await redisClient.set(key, JSON.stringify(sessionData),function(err,data){
        if(!err){
          redisClient.expire(key, sessionTime);
        }
      }); 
    } catch (error) {
      console.info(error);
    }
    console.log(sessionData.userInfo.access_token + " 刷新成功 ");
    return rtn;
  } catch (error) {
    console.log(sessionData.userInfo.access_token + " 刷新失败 ");
    return;
  }
}

module.exports = scheduleTask;
