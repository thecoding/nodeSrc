const {
  isMainThread,
  parentPort,
  workerData,
  threadId,
  MessageChannel,
  MessagePort,
  Worker
} = require('worker_threads');


// function mainThread() {
//   console.log("main process start ");
//   for (let i = 0; i < 5; i++) {
//     const worker = new Worker(__filename, { workerData: i }); //向子线程传递参数
//     worker.on('exit', code => { console.log(`main: worker stopped with exit code ${code}`); });
//     worker.on('message', msg => {
//       console.log(`main: receive ${msg}`);
//       worker.postMessage(msg + 1);
//     });
//   }
//   console.log("main process end");
// }

// function workerThread() {
//   var code = workerData;
//   console.log(`worker: workerDate ${workerData}`);
//   parentPort.on('message', msg => {
//     console.log(`worker: receive ${msg}`);
//   }),
//   parentPort.postMessage(workerData);
//   process.exit(code);
// }

// if (isMainThread) {
//   mainThread();
// } else {
//   workerThread();
// }


class ThreadRun {

  constructor(count=1,fn){
    this.count = count;
    this.fn = fn;
  }

  toRun(){
    if(isMainThread){
      this.mainThread();
    }else{
      this.workerThread();
    }
  }

  mainThread() {
    console.log("main process start ");
    for (let i = 0; i < this.count; i++) {
      const worker = new Worker(__filename, { workerData: i }); //向子线程传递参数
      worker.on('exit', code => { console.log(`main: worker stopped with exit code ${code}`); });
      worker.on('message', msg => {
        console.log(`main: receive ${msg}`);
        worker.postMessage(msg + 1);
      });
    }
    console.log("main process end");
  }

  workerThread() {
    var code = workerData;
    console.log(`worker: workerDate ${workerData}`);
    // parentPort.on('message', msg => {
    //   console.log(`worker: receive ${msg}`);
    // });
    var data;
    (async () => {
      data = await this.fn();
    })();
    parentPort.postMessage(data);
    process.exit(code);
  }
} 