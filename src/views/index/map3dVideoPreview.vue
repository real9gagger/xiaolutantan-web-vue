<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0;overflow:hidden">
            <video 
                ref="videoRef"
                :src="videoUrl"
                :poster="publicAssets.imageVideoDarkBg"
                controls="true" 
                autoplay="true" 
                muted="true"
                class="mvp-video-box"></video>
        </div>
    </div>
</template>

<script setup name="IndexMap3DVideoPreview">
    import { ref, onUnmounted, onMounted } from "vue";
    import { getPageTempData, setPageTempData } from "@/utils/pagehelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const videoRef = ref(null);
    const videoUrl = ref(getPageTempData());
    
    function handleVideoPlay(){
        if(videoRef.value){
            videoRef.value.play(); //处理微信浏览器无法自动播放的问题！
        }
    }
    
    onMounted(() => {
        setTimeout(handleVideoPlay, 100);
    });
    
    onUnmounted(() => {
        URL.revokeObjectURL(videoUrl);
        setPageTempData(null);
        console.log("清理了文件缓存…");
    });
</script>

<style scoped="scoped">
    .mvp-video-box{
        display: block;
        object-fit: contain;
        height: var(--current-window-height);
        max-width: var(--container-max-width);
        width: 100vw;
        background-color: #000;
    }
</style>