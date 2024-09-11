<template>
    <transition name="psp-slide-out">
        <div v-if="isVisible" class="psp-box-container">
            <div class="fx-g1 wi-f" @click="onClose"><!-- 点我关闭层 --></div>
            <div class="psp-box-dialog">
                <h4>分享此页面到</h4>
                <ul class="fx-r fx-wp mg-tb-1rem">
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onShareToWechatFriend">
                        <img src="/photoshop/微信好友.svg" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">微信好友</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onShareToWechatCircle">
                        <img src="/photoshop/朋友圈.svg" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">朋友圈</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onShareToDouyin">
                        <img src="/photoshop/抖音.svg" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">抖音</span>
                    </li>
                    <li class="fx-vm wh-4rem pd-rem5 tp-ee hv-f0 br-rem5 cs-p" @click="onCopyLink">
                        <img src="/photoshop/复制链接.svg" class="psp-li-pic" />
                        <span class="fs-rem6 tc-66">复制链接</span>
                    </li>
                </ul>
                <a class="dp-bk br-1rem tc-66" @click="onClose">取消</a>
            </div>
        </div>
    </transition>
</template>

<script setup name="PageSharePanel">
    import { defineProps, defineModel } from "vue";
    
    const isVisible = defineModel({
        type: Boolean,
        default: false
    });
    
    const emits = defineEmits(["finished"]); //结束时调用函数
    
    function onClose(){
        isVisible.value = false;
        emits("finished", 0x00);
    }
    
    function onShareToWechatFriend(){
        
        isVisible.value = false;
        emits("finished", 0x11);
    }
    
    function onShareToWechatCircle(){
        
        isVisible.value = false;
        emits("finished", 0x22);
    }
    
    function onShareToDouyin(){
        
        isVisible.value = false;
        emits("finished", 0x33);
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
        emits("finished", 0xFF);
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
</style>