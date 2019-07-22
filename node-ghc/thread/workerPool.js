// Access the workerData by requiring it.
const { parentPort, workerData } = require('worker_threads');


// Something you shouldn't run in main thread
// since it will block the main thread.
async function fib(attr) {
  
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on('message', param => {
  // if (typeof param !== 'number') {
  //   throw new Error('param must be a number.');
  // }
  const {url,body,authorization,accessToken} = param;

  console.info(url);

  // (async () => {
  //   const result = await httpUtilPromisify(url,body,authorization,accessToken);  
  //   console.log(typeof result);
  //   // console.info(result);
  //   parentPort.postMessage(result);
  // })();
  
  const httpUtil = require('../utils/httpUtil.js');
  const httpConfig = require('../config/config.js');

  // const {num,page,url,body,authorization,accessToken} = attr;
  
  httpUtil.postAndReturnJson(httpConfig.host + ":"+httpConfig.port+url,body,authorization,accessToken,function(data){
    parentPort.postMessage(data);
  });  

  // Access the workerData.
  // console.log("workerData is", workerData);

  // return the result to main thread.
  // parentPort.postMessage(result);
});