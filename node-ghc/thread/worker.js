const { isMainThread,parentPort} = require('worker_threads');

const httpUtilPromisify = require('../utils/httpUtilPromisify');

//如果是用threadPool，这里都是运行在子线线程中的
if(isMainThread){
  parentPort.on("message", buf => {
    // post to main thread
    parentPort.postMessage({id:buf,data:'test'});
  });  
}else{
  // console.info("workerData ---> "+ workerData); workerData只是在创建worker的时候才有用
  parentPort.on("message", buf => {
    // post to main thread
    const {page,url,body,authorization,accessToken} = buf;
    console.info("worker receive => " + url,body,authorization,accessToken);
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
    })();
    
    
    
  });  
}



