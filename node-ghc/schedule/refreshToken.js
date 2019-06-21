


// * * * * * *
// ┬ ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │ |
// │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
// │ │ │ │ └───── month (1 - 12)
// │ │ │ └────────── day of month (1 - 31)
// │ │ └─────────────── hour (0 - 23)
// │ └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)


var httpUtil = require("../utils/httpUtil");

const schedule = require("node-schedule");

var scheduleTask = {
  refreshToken: function () {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *', () => {
      console.log('scheduleCronstyle:' + new Date());
    });
  }
};


async function refreshTokenAndSession(){
  try {
    await redisClient.keys('sess:*', async (error, keyList) => {
      for(let key in keyList){
        
      }
    });
  } catch (error) {
    console.info(error);
  }

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
