const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');

var filePath = path.join(__dirname,'temp');
var excelFile = path.join(filePath,'111.xlsx');
var rtnExcelData = [['11','222',333,444],['211','311',411]];
var buffer = xlsx.build([{name: "mySheetName", data: rtnExcelData}])


console.info("filePath --> "+filePath);
if(!fs.existsSync(filePath)){
  fs.mkdirSync(filePath);
  console.info("目录创建成功");
}else{
  console.info("目录已存在");
}
console.info("excelFile --> " + excelFile);


fs.writeFileSync(excelFile, buffer,"binary");