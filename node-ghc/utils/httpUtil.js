var http = require("http");
var urlUtil = require('url');
// var file = require("./file");
var querystring = require('querystring');
var utils = require('./utils');

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
    post : function(hostname,port,path,body,acceptType,contentType,authorization,accessToken,success,error){
        var bodyString;
        if(body == null || body === ''){
          body = {};
        }
        if(body.sign != undefined){
          delete body.sign;
        }
        //计算sign
        var sign = utils.getSign(path,body,accessToken);
        body.sign = sign;

        if(body!=null && contentType == "application/json"){
            bodyString = JSON.stringify(body);
        }
        else if(body!=null && contentType == "application/x-www-form-urlencoded"){
            bodyString = querystring.stringify(body);
        }
        var opts = {
            hostname : hostname,
            port : port,
            path : path,
            method: 'POST',
            timeout : 10*1000,
            headers : {
                'Authorization': authorization,
                'Accept':acceptType,
                'Content-Type':contentType,
                'Content-Length':bodyString.length
            }
        }

        // console.info(opts.headers);
 
        var req = http.request(opts,function(res){
            var result = "";
            res.setEncoding("UTF-8");
            res.on("data",function(data){
                result += data;
            });
            res.on('error',function(){
              error(result);
            });
            res.on('end',function(){
                success(result);
            });
 
        });
        req.on('error',this.requestError);
        // file.writeInFile(req);
        req.write(bodyString);
        req.end();
    },
    //提交表单参数，并返回html内容
    postAndReturnHtml : function(url,body,authorization,success,error){
        var urlConfig = urlUtil.parse(url);
        var contentType = "application/x-www-form-urlencoded";
        var acceptType = "text/html";
        this.post(urlConfig.hostname,urlConfig.port,urlConfig.path,body,acceptType,contentType,authorization,'',success,error);
    },
    //get提交url参数，并返回json数据
    getAndReturnJson : function(url,success,error){
        this.get(url,function(data){
            var data = JSON.parse(data);
            success(data);
        },this.responseError(error));
    },
    //提交json参数，并返回json
    postAndReturnJson : function(url,body,authorization,accessToken,success,error){
        var contentType = "application/json";
        var acceptType = "application/json";
        var urlConfig = urlUtil.parse(url);
        this.post(urlConfig.hostname,urlConfig.port,urlConfig.path,body,acceptType,contentType,authorization,accessToken,function(data){
            var data = JSON.parse(data);
            success(data);
        },this.responseError(error));
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