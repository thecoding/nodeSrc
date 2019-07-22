




const {
  isMainThread,
  parentPort,
  workerData,
  threadId,
  MessageChannel,
  MessagePort,
  Worker
} = require('worker_threads');


const Pool = require('worker-threads-pool')
var httpUtilPromisify = require('../utils/httpUtilPromisify')

const pool = new Pool({max: 5});


var PoolUtil = {
  /**
   * @param {*} num 总共查询多少页
   * @param {*} page 第几页开始
   * @param {*} url 
   * @param {*} body 
   * @param {*} authorization 
   * @param {*} accessToken 
   */
  getDownloadData(num,page,url,body,authorization,accessToken){
    
    var arr = new Array();
    return new Promise((resolve, reject) => {
      for (let i = 0; i < num; i++) {
        pool.acquire('./thread/worker.js', {workerData: i}, function (err, worker) {
          if (err) throw err
          console.log(`started worker ${i} (pool size: ${pool.size})`)
          worker.on('exit', function () {
            console.log(`worker ${i} exited (pool size: ${pool.size})`);
          });
          worker.on('error', function(error){
            reject(error);
          });
          worker.on('message', msg => {
            console.log(`pool : receive ${msg.id}`);
            arr.push(msg.data);
            if(arr.length == num){
              console.log("线程结束。。。");
              resolve(arr);
            }
          });
          worker.postMessage({page:page+i,url:url,body:body,authorization:authorization,accessToken:accessToken});

          // 测试
          // (async () => {
          //   let rtnData = "";
          //   try {
          //     //签名 有中文，或者 逗号都不行
          //     rtnData = await httpUtilPromisify.postAndReturnJson(url,body,authorization,accessToken);  
          //     console.info(rtnData);
          //   } catch (error) {
          //     console.error(error);
          //   }
          // })();
        })
      }  
    });
  },
  poolDestroy(){
    // console.log("destroy ....")
    pool.destroy();
    console.log("destroy ....")
  }
}

module.exports = PoolUtil;




// console.info("--------");

// (async () => {
//   var num = 6;
//   var page = 2;
//   var url = '/pay/payCenter/queryPayOut';
//   var body = {"_SEARCH_COUNT":1,"_PAGE_NUMBER":1,"_PAGE_SIZE":10};
//   var accessToken = "006d89ae-6b19-41e9-a0f8-852696c5827d";
//   var authorization = "Bearer " + accessToken;
//   var data = await PoolUtil.getDownloadData(num,page,url,body,authorization,accessToken);
//   console.info("============")
//   console.info(data);
// })();
