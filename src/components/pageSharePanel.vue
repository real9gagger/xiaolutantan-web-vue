<template>
    <transition name="psp-slide-out">
        <div v-if="isVisible" class="psp-box-container">
            <div class="fx-g1 wi-f" @click="onClose"><!-- 点我关闭层 --></div>
            <div class="psp-box-dialog">
                <h4>分享此页面到</h4>
                <ul class="fx-r fx-wp mg-tb-1rem">
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onShareToWechatFriend">
                        <img :src="publicAssets.svgWxFriend" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">微信好友</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onShareToWechatCircle">
                        <img :src="publicAssets.svgWxCircle" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">朋友圈</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onShareToDouyin">
                        <img :src="publicAssets.svgDouyinLogo" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">抖音</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onScanQRcode">
                        <img :src="publicAssets.svgScanQRcode" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">扫码分享</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onCopyLink">
                        <img :src="publicAssets.svgCopyLink" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">复制链接</span>
                    </li>
                </ul>
                <a class="dp-bk br-1rem tc-66" @click="onClose">取消</a>
            </div>
            <transition name="psp-pull-down">
                <div v-if="qrDataURL" class="psp-qrcode-box" @click="onClose">
                    <img :src="qrDataURL" alt="扫码分享" class="psp-qrcode-pic" />
                    <span class="tc-66">请使用手机扫码</span>
                    <canvas ref="canvasBox" class="psp-qrcode-canvas" :width="canvasSize" :height="canvasSize" />
                    <!-- <span v-for="nth in dotCount" :key="nth" class="psp-rect-dot" :style="getDotStyle(nth)"></span> -->
                </div>
            </transition>
        </div>
    </transition>
</template>

<script setup name="PageSharePanel">
    import { defineProps, defineModel, ref, getCurrentInstance, nextTick } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    import qrcode from "qrcode";
    
    const isVisible = defineModel({
        type: Boolean,
        default: false
    });
    
    const $instance = getCurrentInstance();
    const emits = defineEmits(["finished"]); //结束时调用函数
    const qrDataURL = ref(null);
    const isMobile = (navigator.userAgent.indexOf("Mobile") >= 0);
    const dotCount = 900;
    const canvasSize = window.pxOf1rem * 9; /* 等于二维码图片的宽高 */
    const rectSize = 6; //像素。二维码中小块的宽高
    const rectRows = Math.ceil(canvasSize / rectSize); //二维码有多少行
    
    function onClose(){
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x00);
    }
    
    function onShareToWechatFriend(){
        if(isMobile){
            appToast("分享给微信好友失败");
        } else {
            appToast("当前设备不支持此分享方式");
        }
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x11);
    }
    
    function onShareToWechatCircle(){
        if(isMobile){
            appToast("分享到微信朋友圈失败");
        } else {
            appToast("当前设备不支持此分享方式");
        }
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x22);
    }
    
    function onShareToDouyin(){
        if(isMobile){
            appToast("分享到抖音失败");
        } else {
            appToast("当前设备不支持此分享方式");
        }
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x33);
    }
    
    function onScanQRcode(){
        if(qrDataURL.value){
            qrDataURL.value = null;
            return;
        }
        
        //参见：https://github.com/soldair/node-qrcode
        const txt = location.href + (location.search ? "&link_type=SHARED_PAGE" : "?link_type=SHARED_PAGE");
        qrcode.toDataURL(txt, { 
            errorCorrectionLevel: "M",
            margin: 0,
        }).then(url => {
            qrDataURL.value = url;
            nextTick(generateCanvasQrcode);
        }).catch(err => {
            appToast("生成二维码失败：" + err.message);
        });
    }
    
    function onCopyLink(){
        const tempBox = window.document.createElement("textarea"); //创建临时文本框
        
        tempBox.style.opacity = 0.0;
        tempBox.style.position = "fixed";
        tempBox.style.top = "0px";
        tempBox.style.left = "0px";
        tempBox.value = window.location.href;
        
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
            appToast("链接已复制");
        } catch (ex) {
            appToast("复制链接失败：" + ex.message);
        } finally {
            window.document.body.removeChild(tempBox); //删除文本框
        }
        
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0xFF);
    }
    
    function generateCanvasQrcode(){
        const ctx2d = $instance.refs.canvasBox.getContext("2d");
        ctx2d.fillStyle = "#FFFFFF";
        ctx2d.fillRect(0, 0, canvasSize, canvasSize);
    }
    
    function getDotStyle(nth){
        const idx = nth - 1;
        const transX = 20 + Math.floor(idx % 30) * 6;
        const transY = 20 + Math.floor(idx / 30) * 6;
        const delay = 400 + nth * 5;
        return `left:${transX}px;top:${transY}px;animation: psp-dot-fade-out 0ms ease ${delay}ms 1 forwards;`;
        //return `transform:translate(${transX}px,${transY}px);animation: psp-dot-fade-out 0ms ease ${delay}ms 1 forwards;`;
    }
</script>

<style>
    @keyframes psp-qrcode-blur-kf{
        from {
            filter: blur(1rem);
        }
        to {
            filter: blur(0);
        }
    }
    
    @keyframes psp-dot-fade-out{
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .psp-box-container{
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem;
    }
    .psp-box-dialog{
        width: 100%;
        max-width: 600px;
        min-height: 5rem;
        background-color: #fff;
        padding: 1rem;
        border-radius: 1rem;
        text-align: center;
        overflow: hidden;
        user-select: none;
        transition: transform 300ms cubic-bezier(0, 0, 0, 1) 0s;
    }
    .psp-li-pic{
        display: inline-block;
        width: 1.5rem;
        height: 1.5rem;
        margin-bottom: 0.25rem;
    }
    .psp-qrcode-box{
        position: absolute;
        top: 5vh;
        left: calc(50% - 5.5rem);
        z-index: 1;
        padding: 1rem 1rem 0.5rem  1rem;
        background-color: #fff;
        text-align: center;
        border-radius: 0.5rem;
    }
    .psp-qrcode-pic{
        display: block;
        width: 9rem;
        height: 9rem;
        margin-bottom: 0.5rem;
        /* filter: blur(1rem);
        animation: psp-qrcode-blur-kf 400ms ease 200ms 1 forwards; */
    }
    .psp-qrcode-canvas{
        display: block;
        position: absolute;
        left: 1rem;
        top: 1rem;
        z-index: 8;
        width: 9rem;
        height: 9rem;
    }
    .psp-rect-dot{
        display: block;
        position: absolute;
        left: 1rem;
        top: 1rem;
        z-index: 8;
        width: 6px;
        height: 6px;
        background-color: #fff;
    }
    
    .psp-slide-out-enter-from{opacity:0}
    .psp-slide-out-enter-active{transition:opacity 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .psp-slide-out-enter-to{opacity:1}
    .psp-slide-out-leave-from{opacity:1}
    .psp-slide-out-leave-active{transition:opacity 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .psp-slide-out-leave-to{opacity:0}
    
    .psp-slide-out-enter-from > .psp-box-dialog{transform:translateY(30%)}
    .psp-slide-out-enter-to > .psp-box-dialog{transform:translateY(0%)}
    .psp-slide-out-leave-from > .psp-box-dialog{transform:translateY(0%)}
    .psp-slide-out-leave-to > .psp-box-dialog{transform:translateY(30%)}
    
    .psp-pull-down-enter-from{opacity:0;transform:translateY(-50%)}
    .psp-pull-down-enter-active{transition:all 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .psp-pull-down-enter-to{opacity:1;transform:translateY(0%)}
    .psp-pull-down-leave-from{opacity:1;transform:translateY(0%)}
    .psp-pull-down-leave-active{transition:all 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .psp-pull-down-leave-to{opacity:0;transform:translateY(-50%)}
</style>