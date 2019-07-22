const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

var options = {
  auth_pass : 'zxwlpt',
  db : 0
}
var redis = require("redis");
var redisClient = redis.createClient('6379','192.168.1.250',options);

if (isMainThread) {
  module.exports = async function parseJSAsync(script) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: script
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  const script = workerData;
  console.info("work start");
  parentPort.postMessage("work start");
  redisClient.set('test','testvalue');
}