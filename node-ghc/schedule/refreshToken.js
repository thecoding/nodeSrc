


// * * * * * *
// ┬ ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │ |
// │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
// │ │ │ │ └───── month (1 - 12)
// │ │ │ └────────── day of month (1 - 31)
// │ │ └─────────────── hour (0 - 23)
// │ └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)


const schedule = require("node-schedule");

var scheduleTask = {
  refreshToken: function () {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *', () => {
      console.log('scheduleCronstyle:' + new Date());
    });
  }
};


module.exports = scheduleTask;
