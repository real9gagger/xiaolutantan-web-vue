const IS_MOBILE = navigator.userAgent.indexOf("Mobile") >= 0; //是否是移动端
const IS_H5MODE = (window.innerWidth < 768); //是否是h5模式
const IS_WECHAT = navigator.userAgent.indexOf("MicroMessenger") >= 0; //是否是微信内置浏览器

//适用于不处理 Promise catch 的情况，防止不处理 catch 而报错！
function globalEmptyShell(){
    return false;
}

//字符串的哈希值
function stringHashCode(str) {
    let hhh = 0;
    if(str && typeof(str) === "string"){
        for(let ii = 0; ii < str.length; ii++){
            hhh = Math.imul(31, hhh) + (str.charCodeAt(ii) | 0);
        }
    }
    return hhh;
}

//图片加载失败调用的函数
function onImageLoadingError(){
	var evt = window.event;
	var img = (evt.target || evt.srcElement);
	if(evt.type === "error" && img.tagName === "IMG"){
		img.onerror = null;
		img.src = "./images/img_error.png?errorcode=LOADING_FAILED";
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
			$msgbox.children("span").html(msg);
		} else {
			$msgbox = $(`<div class="app-toast-box"><img src="./icons/toast_info.png" alt="提示信息" class="app-toast-icon" /><span>${msg}</span></div>`).appendTo(document.body);
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

//提示弹窗
function alertConfirm(msg, yesText, isAttention){
    return new Promise(function (resolve, reject) {
        let btnText = (yesText || "好");
        let attentionCss = (isAttention ? " attention" : ""); //按钮文字是否为红色
        let hashCode = ("ACBOX" + stringHashCode(msg + btnText + attentionCss));
        
        //根据消息内容和按钮文本，确定弹框唯一性，防止重复添加弹框
        if(document.getElementById(hashCode)){
            document.getElementById(hashCode).remove();
            return reject(-1); //负数表示重复的弹框
        }
        
        let $alertBox = $(`<div id="${hashCode}" class="alert-confirm-container"><div class="alert-confirm-dialog"><p class="alert-confirm-msg">${msg}</p><button type="button" class="alert-confirm-yes${attentionCss}">${btnText}</button></div></div>`).appendTo(document.body);
        
        $alertBox.on("click", function(evt){
            if(evt.target.classList.contains("alert-confirm-container")){
                $(evt.currentTarget).removeClass("showup");
                reject(0);
            } else if(evt.target.classList.contains("alert-confirm-yes")){
                $(evt.currentTarget).removeClass("showup");
                resolve(1);
            }
        }).on("transitionend", function (evt) {
            if(!evt.currentTarget.classList.contains("showup")){
                $(evt.currentTarget).remove();
            }
        });
        
        setTimeout($alertBox.addClass.bind($alertBox), 50, "showup");
    });
}