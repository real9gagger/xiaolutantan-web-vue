/*
    import { toggleFullScreen } from "@/utils/pagehelper.js";
*/
//页面临时数据，用于临时保存几十至上百 MB 的数据。
//这类数据本地存储无法保存，也不建议用 Vuex 保存，只能保存在内存里了！
let pageTempData = null;
//浏览器滚动条宽度
let scrollBarWidth = -1;

//设置临时数据
export function setPageTempData(dat){
    pageTempData = dat;
}

//获取临时数据
export function getPageTempData(){
    return pageTempData;
}

//来回切换全屏浏览
export function toggleFullScreen(){
    const docEl = document.documentElement;
    const isFs = (document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen);
    if(isFs || (window.innerHeight === window.screen.height)){
        if (docEl.requestFullScreen) {
            document.exitFullScreen();
        } else if (docEl.webkitRequestFullScreen) {
            document.webkitCancelFullScreen();
        } else if (docEl.mozRequestFullScreen) {
            document.mozCancelFullScreen();
        } else {
            return true;//仍然是全屏的
        }
        return false;
    } else {
        if (docEl.requestFullScreen) {
            docEl.requestFullScreen();
        } else if (docEl.webkitRequestFullScreen) {
            docEl.webkitRequestFullScreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else {
            return false;//仍然不是全屏的
        }
        return true;
    }
}

//获取比较友好的视频持续时间
export function getFriendlyDuration(seconds){
    if(!seconds){
        return "00:00:00";
    }
    
    const hh = (seconds >= 3600 ? Math.floor(seconds / 3600) : 0);
    const mm = (seconds >= 60 ? Math.floor((seconds / 60) % 60): 0);
    const ss = Math.floor(seconds % 60);
    
    return (
        (hh >= 10 ? "" : "0") + hh + ":" + 
        (mm >= 10 ? "" : "0") + mm + ":" + 
        (ss >= 10 ? "" : "0") + ss
    );
}

//查找数组中最小值所在的索引（仅对数字数组有效）
export function arrayFindIndexOfMinValue(arr){
    if(!arr || !arr.length){
        return -1;
    }
    
    let lowest = 0;
    
    for(let kx = 1; kx < arr.length; kx++){
        if(arr[kx] < arr[lowest]){
            lowest = kx;
        }
    }
    
    return lowest;
}

//获取浏览器的默认滚动条宽度
export function getScrollBarWidth() {
    if(scrollBarWidth >= 0){
        return scrollBarWidth;
    }

    let el = document.createElement("div");
    
    el.style.position = "fixed";
    el.style.left = "0";
    el.style.top = "0";
    el.style.zIndex = "0";
    el.style.width = "100px";
    el.style.height = "100px";
    el.style.overflow = "scroll";
    el.style.visibility = "hidden";
    
    document.body.appendChild(el);
    
    scrollBarWidth = (el.offsetWidth - el.clientWidth) || 0;
    
    el.remove();
    
    return scrollBarWidth;
}