/*
    import fileUploder from "@/utils/uploader.js";
*/

import axios from "axios";

const UPLOAD_TRIGGER_INTERVAL = 1000; //模拟上传触发间隔（毫秒）

const instance = axios.create({
    baseURL: location.origin,
    timeout: 15000,
    headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": "Bearer Xltt-Token"
    },
    /* onUploadProgress: function (progressEvent) { //上传进度
        console.log(progressEvent);
    } */
});

let myAbortController = null;
let fileNth = 0; //这是上传的第几个文件
let isTest = (process.env.NODE_ENV === "production" ? 0 : 1);

//（内部函数）模拟上传进度时，定时器调用的函数
function fn_ProgressInterval(that){
    const randomNumber = Math.round(20 * Math.random());
    
    if(that.progressPercentage >= 100){
        that.progressPercentage = 0; //重置！
    }
    
    if((that.progressPercentage + randomNumber) < 100){
        that.progressPercentage += randomNumber;
        that.progressCallback && that.progressCallback(that.progressPercentage, that.uploadFileIndex);
    }
}

//（内部函数）上传一张图片的函数
function fn_UploadPicture(picFile){
    return new Promise(function(resolve, reject) {
        const formData = new FormData();
        formData.append("my_file", picFile);
        
        myAbortController = new AbortController();
        fileNth++;
        
        instance.post("/xlttapi?action=upload_picture&is_test=" + isTest + "&file_nth=" + fileNth, formData, { signal: myAbortController.signal }).then(res => {
            //console.log("上传文件结果:::", res);
            myAbortController = null;
            if(res.data?.code === 200){
                resolve(res.data.data);
            } else {
                reject(res.data?.msg || "空的响应体");
            }
        }).catch(err => {
            //console.error("上传文件出错:::", err);
            myAbortController = null;
            reject(err.message);
        });
    });
}

function fileUploder(){
	this.progressTimer = 0; //模拟上传进度的定时器
    this.progressPercentage = 0; //上传进度百分数
    this.uploadFileIndex = 0; //当前正在上传第几个文件，负数表示终止当前队列的上传
    this.progressCallback = null; //上传进度回调函数
    this.successCallback = null; //上传成功回调函数
    this.errorCallback = null; //上传出错回调函数
}

//上传一张图片
fileUploder.prototype.upload = function(picFile){
    this.progressTimer = setInterval(fn_ProgressInterval, UPLOAD_TRIGGER_INTERVAL, this); //模拟上传进度
    fn_UploadPicture(picFile).then(dat => {
        clearInterval(this.progressTimer);
        this.progressPercentage = 100;
        this.progressTimer = 0;
        this.progressCallback && this.progressCallback(100, 0);
        setTimeout(this.successCallback, 200, dat, 0); //延迟一点时间
    }).catch(msg => {
        clearInterval(this.progressTimer);
        this.progressPercentage = 0;
        this.progressTimer = 0;
        this.errorCallback && this.errorCallback(msg, 0);
    });
}

//上传多张图片，参数是数组类型
fileUploder.prototype.queue = function(picList){
    if(this.uploadFileIndex < 0 || this.uploadFileIndex >= picList.length){
        return;
    }
    
    this.progressTimer = setInterval(fn_ProgressInterval, UPLOAD_TRIGGER_INTERVAL, this); //模拟上传进度
    fn_UploadPicture(picList[this.uploadFileIndex]).then(dat => {
        clearInterval(this.progressTimer);
        this.progressPercentage = 100;
        this.progressTimer = 0;
        this.progressCallback && this.progressCallback(100, this.uploadFileIndex);
        setTimeout(this.successCallback, 200, dat, this.uploadFileIndex); //延迟一点时间
        this.uploadFileIndex++;
        this.queue(picList);
    }).catch(msg => {
        clearInterval(this.progressTimer);
        this.progressPercentage = 0;
        this.progressTimer = 0;
        this.errorCallback && this.errorCallback(msg, this.uploadFileIndex);
        this.uploadFileIndex++;
        this.queue(picList);
    });
}

fileUploder.prototype.progress = function(callback){
    this.progressCallback = (typeof(callback) === "function" ? callback : null);
    return this;
}

fileUploder.prototype.success = function(callback){
    this.successCallback = (typeof(callback) === "function" ? callback : null);
    return this;
}

fileUploder.prototype.error = function(callback){
    this.errorCallback = (typeof(callback) === "function" ? callback : null);
    return this;
}

//中止上传
fileUploder.prototype.abort = function(){
    if(myAbortController){
        myAbortController.abort("用户取消上传");
        myAbortController = null;
    }
    this.uploadFileIndex = -8888;
    return this;
}

//重置
fileUploder.prototype.reset = function(){
    clearInterval(this.progressTimer);
    
    this.progressTimer = 0; //模拟上传进度的定时器
    this.progressPercentage = 0; //上传进度百分数
    this.uploadFileIndex = 0; //当前正在上传第几个文件
    
    return this;
}

//销毁
fileUploder.prototype.dispose = function(){
    this.progressCallback = null; //上传进度回调函数
    this.successCallback = null; //上传成功回调函数
    this.errorCallback = null; //上传出错回调函数
    
    this.reset();
    this.abort();
    
    return this;
}

export default fileUploder;