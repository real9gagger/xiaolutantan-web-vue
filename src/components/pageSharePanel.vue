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
                    <span class="tc-66">{{isDrawEnd ? "请使用手机扫码" : "正在生成二维码…"}}</span>
                    <canvas v-if="!isDrawEnd" ref="canvasBox" class="psp-qrcode-canvas" :width="canvasSize" :height="canvasSize" />
                </div>
            </transition>
        </div>
    </transition>
</template>

<script setup name="PageSharePanel">
    import { ref, getCurrentInstance, nextTick } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    import qrcode from "qrcode";
    
    const isVisible = defineModel({
        type: Boolean,
        default: false
    });
    
    const $instance = getCurrentInstance();
    const emits = defineEmits(["finished"]); //结束时调用函数
    const qrDataURL = ref(null);
    const isDrawEnd = ref(false);
    const canvasSize = Math.round(window.pxOf1rem * 10); /* 等于二维码图片的宽高 */
    const rectSize = 20; //像素。二维码中小块的宽高
    const rectRows = Math.ceil(canvasSize / rectSize); //二维码有多少行
    const rectCount = rectRows * rectRows;
    const nonRVs = { //非响应式变量（non Responsive Variables）
        drawIndex: 0,
        ctx2D: null
    };
    
    function onClose(){
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x00);
    }
    
    function onShareToWechatFriend(){
        if(IS_MOBILE){
            appToast("分享给微信好友失败");
        } else {
            appToast("当前设备不支持此分享方式");
        }
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x11);
    }
    
    function onShareToWechatCircle(){
        if(IS_MOBILE){
            appToast("分享到微信朋友圈失败");
        } else {
            appToast("当前设备不支持此分享方式");
        }
        isVisible.value = false;
        qrDataURL.value = null;
        emits("finished", 0x22);
    }
    
    function onShareToDouyin(){
        if(IS_MOBILE){
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
            errorCorrectionLevel: "H",
            margin: 0,
            type: "image/jpeg",
            quality: 1,
            scale: 5, //每个小黑点的宽度
            //width: canvasSize
        }).then(url => {
            qrDataURL.value = url;
            if(nonRVs.drawIndex < rectCount){
                isDrawEnd.value = false;
                nextTick(() => {
                    nonRVs.drawIndex = 0;
                    nonRVs.ctx2D = $instance.refs.canvasBox.getContext("2d");
                    window.requestAnimationFrame(generateCanvasQrcode);
                });
            }
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
        if(!qrDataURL.value){
            return;
        }
        
        const endX = Math.floor(nonRVs.drawIndex % rectRows) * rectSize;
        const endY = Math.floor(nonRVs.drawIndex / rectRows) * rectSize;
        
        nonRVs.ctx2D.fillStyle = "#FFFFFF";
        nonRVs.ctx2D.fillRect(0, 0, canvasSize, canvasSize);
        
        //逐行绘制
        nonRVs.ctx2D.clearRect(0, 0, canvasSize, endY);
        nonRVs.ctx2D.clearRect(0, endY, endX, rectSize);
        
        nonRVs.drawIndex++;
        
        if(nonRVs.drawIndex < rectCount){
            window.requestAnimationFrame(generateCanvasQrcode);
        } else {
            nonRVs.ctx2D = null;
            isDrawEnd.value = true;
        }
    }
</script>

<style>
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
        max-width: var(--container-max-width);
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
        left: calc(50% - 6rem);
        z-index: 1;
        padding: 1rem 1rem 0.5rem  1rem;
        background-color: #fff;
        text-align: center;
        border-radius: 0.5rem;
    }
    .psp-qrcode-pic{
        display: block;
        width: 10rem;
        height: 10rem;
        margin-bottom: 0.5rem;
    }
    .psp-qrcode-canvas{
        display: block;
        position: absolute;
        left: 1rem;
        top: 1rem;
        z-index: 8;
        width: 10rem;
        height: 10rem;
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
    .psp-pull-down-enter-active{transition:all 300ms cubic-bezier(0, 0, 0, 1) 0s} /* 取值网站 https://cubic-bezier.com */
    .psp-pull-down-enter-to{opacity:1;transform:translateY(0%)}
    .psp-pull-down-leave-from{opacity:1;transform:translateY(0%)}
    .psp-pull-down-leave-active{transition:all 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .psp-pull-down-leave-to{opacity:0;transform:translateY(-50%)}
</style>