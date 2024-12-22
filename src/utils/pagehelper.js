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
    if(isFs){
        if (docEl.requestFullScreen) {
            document.exitFullScreen();
        } else if (docEl.webkitRequestFullScreen) {
            document.webkitExitFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            document.mozExitFullscreen();
        } else if (docEl.msExitFullScreen) {
            document.msExitFullScreen();
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
        } else if (docEl.msRequestFullScreen) {
            document.msRequestFullScreen();
        }  else {
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

//复制文本内容
export function copyTextContent(txt){
    if(!txt){
        return;
    }
    
    const tempBox = window.document.createElement("textarea"); //创建临时文本框
    
    tempBox.style.opacity = 0.0;
    tempBox.style.position = "fixed";
    tempBox.style.top = "0px";
    tempBox.style.left = "0px";
    tempBox.value = txt;
    
    window.document.body.appendChild(tempBox);
    if (!tempBox.select) {
        const selection = window.getSelection();
    	const range = window.document.createRange();
        range.selectNodeContents(tempBox);
        selection.removeAllRanges();
        selection.addRange(range);
        tempBox.setSelectionRange(0, tempBox.value.length);
    } else {
        tempBox.select();
    }
    
    try {
        window.document.execCommand("copy");
        appToast("已复制");
    } catch (ex) {
        appToast("复制失败：" + ex.message);
    } finally {
        window.document.body.removeChild(tempBox); //删除文本框
    }
}

//让网页的主题色变成黑色（短视频沉浸模式）
export function makeThemeColorDark(){
    $("#metaThemeColorTag").attr("content", "#000");
    document.body.style.backgroundColor = "#000";
}

//让网页的主题色变成白色
export function makeThemeColorLight(){
    $("#metaThemeColorTag").attr("content", "#fff");
    document.body.style.backgroundColor = null;
}