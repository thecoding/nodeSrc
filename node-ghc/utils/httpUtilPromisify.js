var http = require("http");
var urlUtil = require('url');
// var file = require("./file");
var querystring = require('querystring');


var httpConfig = {
  hostname: '192.168.2.186',
  port: 8021,
}



var HttpUtil = {
    //get提交url，返回html数据
    get : function(url,success,error){
        http.get(url,function(res){
            var result = "";
            res.setEncoding("UTF-8");
            res.on("data",function(data){
                result += data;
            });
            res.on('error',error);
            res.on('end',function(){
                success(result);
            });
        }).on('error',this.requestError);
    },
    post : function(path,body,acceptType,contentType,authorization,success,error){
        var bodyString = "";
        if(body!=null && contentType == "application/json"){
            bodyString = JSON.stringify(body);
        }
        else if(body!=null && contentType == "application/x-www-form-urlencoded"){
            bodyString = querystring.stringify(body);
        }
        var opts = {
            hostname : httpConfig.hostname,
            port : httpConfig.port,
            path : path,
            method: 'POST',
            headers : {
                'Authorization': authorization,
                'Accept':acceptType,
                'Content-Type':contentType,
                'Content-Length':bodyString.length
            }
        }

        return new Promise((resolve,reject) => {
          
          var req = http.request(opts,function(res){
            var result = "";
            res.setEncoding("UTF-8");


            res.on("data",function(data){
                result += data;
            });
            // res.on('error',function(){
            //   console.info(11);
            //   console.info(result);
            //   reject(result);
            //   req.write(bodyString);
            //   req.end(); 
            // });
            
            //有返回
            res.on('end',function(){
              // console.info("返回状态: "+res.statusCode);
              // console.info(result);
              if(res.statusCode == 200){
                resolve(result);
              }else{
                reject(result);
              }
            });
          });

            req.write(bodyString);
            req.end();  
        });

    },
    //提交表单参数，并返回html内容
    postAndReturnHtml : function(path,body,authorization){
        var contentType = "application/x-www-form-urlencoded";
        var acceptType = "text/html";
        return this.post(path,body,acceptType,contentType,authorization);
    },
    //get提交url参数，并返回json数据
    getAndReturnJson : function(url,success,error){
        this.get(url,function(data){
            var data = JSON.parse(data);
            success(data);
        },this.responseError(error));
    },
    //提交json参数，并返回json
    postAndReturnJson : function(path,body,authorization){
        var contentType = "application/json";
        var acceptType = "application/json";
        return this.post(path,body,acceptType,contentType,authorization);
    },
    requestError : function(error){
        console.log("请求失败--"+error.message);
    },
    responseError : function(error){
        return  error || function(e){
            console.log("响应失败--"+e.message);
        };
    }
}
 
module.exports = HttpUtil;