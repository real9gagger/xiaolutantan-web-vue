<template>
    <div v-if="videoSrc" class="cvs-container">
        <video ref="videoRef" class="dp-ib va-m bg-00" muted="true" preload="auto"
            :src="videoSrc"
            :width="boxWidth"
            :height="boxHeight"
            @loadedmetadata="onVideoLoaded"
            @canplay="onVideoCanPlay" />
        <img ref="imgRef" class="dp-ib va-m"
            :src="publicAssets.iconVideoSnapshotFlag"
            :width="imgSize"
            :height="imgSize"
            @load="onImageLoaded" />
        <canvas ref="canvasRef" class="dp-ib va-m"
            :width="boxWidth"
            :height="boxHeight" />
    </div>
</template>

<script setup name="CreateVideoSnapshot">
    import { onUnmounted, ref } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    /**
    * 创建视频截帧
    */
    
    const videoSrc = ref("");
    const videoRef = ref(null);
    const imgRef = ref(null);
    const canvasRef = ref(null);
    const boxWidth = ref(300); //宽度固定为定值
    const boxHeight = ref(0);
    const imgSize = 100;
    const nonRVs = {
        loadProgress: 0,
        timerID: 0,
        tryTimes: 0
    };
    
    function onVideoLoaded(evt){
        boxHeight.value = Math.floor(boxWidth.value * evt.target.videoHeight / evt.target.videoWidth);
        nonRVs.loadProgress++;
    }
    
    function onVideoCanPlay(evt){
        evt.target.play().catch(globalEmptyShell);
        nonRVs.loadProgress++;
    }
    
    function onImageLoaded(evt){
        nonRVs.loadProgress++;
    }
    
    function loadCompleteCallback(cb){
        //console.log(nonRVs)
        if(nonRVs.loadProgress === 3){
            console.log("再延迟一点时间…");
            nonRVs.loadProgress++;
        } else if(nonRVs.loadProgress >= 4){
            resetTimerID();
            
            const ctx = canvasRef.value.getContext("2d");
            const startX = (boxWidth.value - imgSize) / 2;
            const startY = (boxHeight.value - imgSize) / 2;
            
            ctx.fillRect(0, 0, boxWidth.value, boxHeight.value);
            ctx.drawImage(videoRef.value, 0, 0, boxWidth.value, boxHeight.value);
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, boxWidth.value, boxHeight.value);
            ctx.drawImage(imgRef.value, startX, startY, imgSize, imgSize);
            
            cb(canvasRef.value.toDataURL());
            
            videoSrc.value = null;
        } else {
            if((++nonRVs.tryTimes) >= 30){
                resetTimerID();
                cb(null);
                videoSrc.value = null;
            }
        }
    }
    
    function resetTimerID(){
        clearInterval(nonRVs.timerID);
        nonRVs.loadProgress = 0;
        nonRVs.tryTimes = 0;
        nonRVs.timerID = 0;
    }
    
    function startSnapshot(src){ //获取视频截帧（第一帧）
        videoSrc.value = src;
        resetTimerID();
        return new Promise(function (resolve) {
            if(videoSrc.value){
                nonRVs.timerID = setInterval(loadCompleteCallback, 100, resolve);
            } else {
                resolve(null);
            }
        });
    }
    
    onUnmounted(() => {
        clearInterval(nonRVs.timerID);
    });
    
    defineExpose({
        startSnapshot
    });
</script>

<style>
    .cvs-container{
        position: fixed;
        top: 0;
        left: 0;
        z-index: 0;
        opacity: 0;
    }
</style>