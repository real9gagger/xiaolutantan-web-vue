
/*
    import { needDebounce } from "@/utils/cocohelper.js";
*/

//防抖定时器ID
let debounceTimer = 0;
//节流开关
let isThrottled = false;

// 防抖
export function needDebounce(func, delay, ...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay, ...args);
}

// 节流
export function needThrottle(func, delay, ...args){
    if (!isThrottled) {
        isThrottled = true;
        func(...args);
        debounceTimer = setTimeout(() => isThrottled=false, delay);
    }
}

// 清除定时器
export function clearTimer(isJustDoIt){
    if(isJustDoIt && debounceTimer){
        clearTimeout(debounceTimer);
        debounceTimer = 0;
    }
}

// 定时器是否正在运行
export function isTimerRunning(){
    return (debounceTimer > 0);
}