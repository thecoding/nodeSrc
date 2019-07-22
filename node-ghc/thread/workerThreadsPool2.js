
//help url = https://libraries.io/npm/node-worker-threads-pool

const { StaticPool } = require('node-worker-threads-pool');

const filePath = './thread/workerPool.js';

const httpUtilPromisify = require('../utils/httpUtilPromisify.js');
const utils = require('../utils/utils.js');

const pool = new StaticPool({
  size: 2,
  task: filePath
});

module.exports = function createExcel(attr){
  

  var arr = new Array();
  return new Promise((resolve,reject) => {
    const {num,page,url,body,authorization,accessToken} = attr;

    for (let i = 0; i < num; i++) {
      (async () => {
        
        // This will choose one idle worker in the pool
        // to execute your heavy task without blocking
        // the main thread!

        if(body._PAGE_NUMBER){
          delete body._PAGE_NUMBER;
        }
        body._PAGE_NUMBER = page + i;       
        // console.info(body._PAGE_NUMBER);
        var queryParam = {
          url: url,
          body: body,
          authorization: authorization,
          accessToken : accessToken
        }
        const res = await pool.exec(queryParam);
        
        arr.push(res);
        if(arr.length == num){
          setTimeout(() => {
            console.info('完成时间：'+new Date().toFormat("YYYY-MM-DD HH24:MI:SS"));  
            resolve(arr);
          }, 2000);
          
          console.info(arr);
        }
      })();
    }
  });
}
