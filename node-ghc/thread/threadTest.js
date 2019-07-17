const {
  isMainThread,
  parentPort,
  workerData,
  threadId,
  MessageChannel,
  MessagePort,
  Worker
} = require('worker_threads');

var httpUtilPromisify = require('../utils/httpUtilPromisify.js');



// function mainThread() {
//   console.log("main process start ");
//   for (let i = 0; i < 5; i++) {
//     const worker = new Worker(__filename, { workerData: i }); //向子线程传递参数
//     worker.on('exit', code => { console.log(`main: worker stopped with exit code ${code}`); });
//     worker.on('message', msg => {
//       console.log(`main: receive ${msg}`);
//       arr.push(msg);
//       if(arr.length < 5){
//         worker.postMessage(msg + 1);
//       }else{
//         console.info(arr);
//         return arr;
//       }
//     });
//   }
// }


function mainThread(obj){
  var arr = new Array();
  var param = obj;
  var page = obj.page;
  return new Promise((resolve,reject) => {
    for (let i = 0; i < obj.num; i++) {
      // console.log("main process start ");
      param.page = page + i;
      console.info("page = "+param.page,i);
      const worker = new Worker(__filename, { workerData: param }); //向子线程传递参数
      worker.on('exit', code => { console.log(`main: worker stopped with exit code ${code}`);});
      worker.on('error', error => {reject(error)});
      worker.on('message', msg => {
        console.log(`main: receive page is ${msg.id}`);
        arr.push(msg.data);
        if(arr.length >= obj.num){
          resolve(arr);
        }
      });
    }
  });
}

function workerThread() {
  const {page,url,body,authorization,accessToken} = workerData;
  console.log(`worker: workerDate ${page} ${url} ${body} ${authorization} ${accessToken}`);
  parentPort.on('message', msg => {
    console.log(`worker: receive-----> ${msg}`);
  });

  if(body._PAGE_NUMBER){
    delete body._PAGE_NUMBER;
  }
  body._PAGE_NUMBER = page;
  
  (async () => {
    let rtnData = "";
    try {
      rtnData = await httpUtilPromisify.postAndReturnJson(url,body,authorization,accessToken);  
    } catch (error) {
      console.error(error);
    }
    parentPort.postMessage({id:page,data:rtnData});
    // process.exit();
  })();
}

// if (isMainThread) {
//   (async () => {
//     let s = await mainThread();
//     console.info(" end ....")
//     console.info(s);
//   })();
//   // console.info();
// } else {
//   workerThread();
// }


var threadTest = {
  threadRun : async function(num,page,url,body,authorization,accessToken){
    var obj = {
      num: num,
      page: page,
      url: url,
      body: body,
      authorization: authorization,
      accessToken: accessToken
    }
    if (isMainThread) {
      let rtn
      try {
        rtn = await mainThread(obj);
        console.info(" end ....")
        console.info(rtn);  
      } catch (error) {
      }
      return rtn;
    } else {
      workerThread();
    }
  }
}

module.exports = threadTest;

// var num = 6;
//   var page = 2;
//   var url = '/pay/payCenter/queryPayOut';
//   var body = {"_SEARCH_COUNT":1,"_PAGE_NUMBER":1,"_PAGE_SIZE":10};
//   var accessToken = "006d89ae-6b19-41e9-a0f8-852696c5827d";
//   var authorization = "Bearer " + accessToken;
// threadTest.threadRun(6,2,'/pay/payCenter/queryPayOut',{"_SEARCH_COUNT":1,"_PAGE_NUMBER":1,"_PAGE_SIZE":10},'Bearer de5f09f7-0049-49c5-8682-8502f12a22a8','de5f09f7-0049-49c5-8682-8502f12a22a8');
