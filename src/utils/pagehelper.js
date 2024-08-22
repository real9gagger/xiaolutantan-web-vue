/*
    import { toggleFullScreen } from "@/utils/pagehelper.js";
*/
//页面临时数据，用于临时保存几十至上百 MB 的数据。
//这类数据本地存储无法保存，也不建议用 Vuex 保存，只能保存在内存里了！
let pageTempData = null;

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