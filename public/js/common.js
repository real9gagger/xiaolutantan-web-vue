//图片加载失败调用的函数
function onImageLoadingError(){
	var evt = window.event;
	var img = (evt.target || evt.srcElement);
	if(evt.type === "error" && img.tagName === "IMG"){
		img.onerror = null;
		img.src = "../images/img_error.png?errorcode=LOADING_FAILED";
	}
}

// 最多保留 2 位小数！返回的是 number 类型，而 tofixed 返回的字符串
function mathRound2(num){
	var real_num = (+num || 0);
	var pows = 100; //默认 两位小数
	return Math.round(real_num * pows) / pows;
}

//格式化日期
function formatDate(dateObj, formatStr) {
	if(!dateObj){
		dateObj = new Date();
	}
	
	if(!formatStr){
		formatStr = "yyyy/MM/dd hh:mm:ss";
	}
	
    let ooo = [
		[/(y+)/, dateObj.getFullYear()], //year
        [/(M+)/, dateObj.getMonth() + 1], //month
        [/(d+)/, dateObj.getDate()], //day
        [/(h+)/, dateObj.getHours()], //hour
        [/(m+)/, dateObj.getMinutes()], //minute
        [/(s+)/, dateObj.getSeconds()], //second
        [/(q+)/, Math.floor(dateObj.getMonth() / 3) + 1], //quarter
        [/(S+)/, dateObj.getMilliseconds()] //millisecond
    ];
	
    for (let arr of ooo) {
        if (arr[0].test(formatStr)) {
			let mat = RegExp.$1;
			let val = arr[1].toString();
			if(val.length >= mat.length){
				formatStr = formatStr.replace(mat, val);
			} else {
				formatStr = formatStr.replace(mat, ("00000000" + val).substr(-mat.length));
			}
        }
    }
	
    return formatStr;
}

//动画结束后自动移除相关动画的CSS样式，防止页面返回时重新运行动画
function onceAnimationOnly(evt){
    evt.target.style.animation = "none";
}

//吐司提示
function appToast(msg, duration){
	if(msg){
		let $msgbox = $(document.body).children(".app-toast-box");
		if($msgbox.length){
			clearTimeout($msgbox.data("appToastTimerID1"));
			clearTimeout($msgbox.data("appToastTimerID2"));
			$msgbox.html(msg);
		} else {
			$msgbox = $(`<div class="app-toast-box">${msg}</div>`).appendTo(document.body);
		}
		
		let tid1 = setTimeout(function(){
			let posX = Math.round((window.innerWidth - $msgbox.innerWidth()) / 2);
			$msgbox.css({ "left": posX, "opacity": 1 });
		}, 50);
		
		let tid2 = setTimeout(function(){
			$msgbox.one("transitionend", function () {
				$(this).remove();
			}).css("opacity", 0);
		}, Math.max(+duration || 0, 2000));//最小 2 秒
		
		$msgbox.data("appToastTimerID1", tid1).data("appToastTimerID2", tid2);
	}
}