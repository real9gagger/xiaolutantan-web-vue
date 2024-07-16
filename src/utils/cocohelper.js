
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
        setTimeout(() => isThrottled=false, delay);
    }
}