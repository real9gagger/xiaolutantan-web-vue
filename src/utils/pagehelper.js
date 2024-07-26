/*
    import { toggleFullScreen } from "@/utils/pagehelper.js";
*/

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