<template>
    <div class="plb-loading-container fx-vm" :class="{'fadeout': props.isFadeOut}" @transitionend="onBoxTransitionEnd">
        <div class="dp-bk ps-a po-mc tc-mc ta-c lh-1x">
            <h4 class="fs-1rem5">720</h4>
            <p class="fs-rem6">全景游览</p>
        </div>
        <div class="plb-loading-circle"></div>
    </div>
</template>

<script setup name="PanoramaLoadingBox">
    import { defineProps, defineEmits } from "vue";
    
    const props = defineProps({
        isFadeOut: { //是否渐隐（淡出）
            type: Boolean,
            default: false
        }
    });
    
    const emits = defineEmits(["fadeoutend"]);//fade out end.
    
    function onBoxTransitionEnd(){
        emits("fadeoutend", true);
    }
</script>

<style>
    @keyframes plb-panorama-loading-kf{
        from {
            transform: rotateZ(0deg);
        }
        to {
            transform: rotateZ(360deg);
        }
    }
    
    .plb-loading-container{
        position: absolute;
        inset: 0;
        z-index: 666666;
        background-color: #fff;
        transition: opacity 400ms;
        opacity: 1;
    }
    .plb-loading-container.fadeout{
        opacity: 0;
    }
    
    .plb-loading-circle{
        position: relative;
        width: 5rem;
        height: 5rem;
        border: 0.2rem solid var(--main-color);
        border-radius: 50%;
        animation: plb-panorama-loading-kf 2s linear infinite;
    }
    .plb-loading-circle::after{
        content: "";
        display: block;
        position: absolute;
        left: calc(50% - 0.5rem);
        top: -0.6rem;
        z-index: 1;
        width: 1rem;
        height: 1rem;
        background-color: var(--main-color);
        border: 0.25rem solid #fff;
        border-radius: 50%;
        box-sizing: border-box;
    }
</style>