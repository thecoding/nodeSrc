
//help url = https://libraries.io/npm/node-worker-threads-pool

const { StaticPool } = require('node-worker-threads-pool');

const filePath = './thread/workerPool.js';
var xlsx = require('node-xlsx');

const httpUtilPromisify = require('../utils/httpUtilPromisify.js');
const StringUtils = require('../utils/stringUtils');
const utils = require('../utils/utils.js');
const fs = require('fs');

const pool = new StaticPool({
  size: 2,
  task: filePath
});

module.exports = function createExcel(attr){

  return new Promise((resolve,reject) => {
    const {url,body,authorization,accessToken,excelFile} = attr;
    var queryParam = body;
    // //这里可以做为配置文件 
    queryParam._SEARCH_COUNT = 1;//有这个参数，就会返回total\size\current\hasNext\pages
    queryParam._PAGE_NUMBER = 1;
    queryParam._PAGE_SIZE = 2;

    var excelData = new Array(); //excel数据
    var excelLables = StringUtils.isEmpty(queryParam.excelLables) ? new Array() : queryParam.excelLables.split(",");
    if(excelLables.length>0){
      excelData.push(excelLables); //表头
    }
    var excelKeys = queryParam.excelKeys; // 字段名

    delete queryParam.excelKeys;
    delete queryParam.excelLables;

    var total = 0;
    var allJsonData = new Array();
    
    (async () => {
      try {
        let rtn = await httpUtilPromisify.postAndReturnJson(url, queryParam, authorization,accessToken);
        //表第一行数据 
        total = JSON.parse(rtn).content.total;
        allJsonData.push(rtn);

        var totalPage = Math.ceil(total/queryParam._PAGE_SIZE); //总共多少页
        if(totalPage > 1) {
          for (let i = 0; i < totalPage-1; i++) {
            if(queryParam._PAGE_NUMBER){
              delete body._PAGE_NUMBER;
            }
            queryParam._PAGE_NUMBER = 2 + i;   
            var param = {
              url:url,
              body:queryParam,
              authorization:authorization,
              accessToken: accessToken
            }
            const res = await pool.exec(param);
            allJsonData.push(res);
            if(allJsonData.length == totalPage){
              var rtnExcelData = arrToFile(excelData,excelKeys,allJsonData);
              var buffer = xlsx.build([{name: "mySheetName", data: rtnExcelData}])
              fs.writeFileSync(excelFile, buffer,"binary")
              console.info("数据处理完成");
              resolve("success");
            }
          } 
        }
      } catch (error) {
        try {
          console.info(error);
          reject(error);
        } catch (error) {
          console.info(JSON.stringify(error));
          reject(error);
        }
      }
    })();
  });
}


/**
 * @param {excel数据} excelData 加了表头或没有表头
 * @param {excel字段} excelKeys 
 * @param {需要处理的数据} dataArr 
 */
function arrToFile(excelData,excelKeys,dataArr){
  // //处理数据
  var keys = excelKeys.split(","); //取的json key
  var countKeyArry = new Array(keys.length); //统计的字段
  var countNum = 0;
  var isAddCount = false;
  for(var j=0;j<dataArr.length;j++){
    if(dataArr[j].length <= 0){
      continue;
    }
    var json = dataArr[j];
    var items;
    if(typeof json === 'string'){
      items = JSON.parse(json).content.records;
    }else if(typeof json === 'object'){
      items = json.content.records;
    }else{
      console.error('数据格式不正确');
      continue;
    }
    for(var i=0;i<items.length;i++){
      countNum = countNum + 1;
      var item = items[i];
      var oneRow = new Array();
      for(let key in keys){
        var name = keys[key];
        var value = item[name];

        if(name.indexOf('*') == name.length-1){ //是以*结尾
          name = name.substring(0,name.length-1);
          countKeyArry[key] = countNum; //统计条数
          isAddCount = true;
        }
        if(name.indexOf('@') == name.length-1){ //是以@结尾 计算总值
          name = name.substring(0,name.length-1);
          countKeyArry[key] = countKeyArry[key] == undefined ? 0 : countKeyArry[key] + parseFloat(value);
          isAddCount = true;
        }
        oneRow.push(StringUtils.isEmpty(value) ? '' : value);
      }
      excelData.push(oneRow);
    }
  }
  if(isAddCount){
    excelData.push(countKeyArry);
  }
  console.info(excelData);
  return excelData;
}