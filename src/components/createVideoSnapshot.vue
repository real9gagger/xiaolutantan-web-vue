<template>
    <div v-if="videoSrc" class="cvs-container">
        <video ref="videoRef" class="dp-ib va-m bg-00" muted="true" preload="auto"
            :src="videoSrc"
            :width="boxWidth"
            :height="boxHeight"
            @loadedmetadata="onVideoLoaded"
            @canplay="onVideoCanPlay" />
        <canvas ref="canvasRef" class="dp-ib va-m"
            :width="boxWidth"
            :height="boxHeight" />
    </div>
</template>

<script setup name="CreateVideoSnapshot">
    import { onUnmounted, ref } from "vue";
    
    /**
    * 创建视频截帧
    */
    
    const videoSrc = ref("");
    const videoRef = ref(null);
    const canvasRef = ref(null);
    const boxWidth = ref(300); //宽度固定为定值
    const boxHeight = ref(0);
    const nonRVs = {
        loadProgress: 0,
        timerID: 0,
        tryTimes: 0,
        videoDuration: 0,
        videoWidth: 0,
        videoHeight: 0
    };
    
    function onVideoLoaded(evt){
        nonRVs.videoDuration = Math.floor(evt.target.duration);
        nonRVs.videoWidth = evt.target.videoWidth;
        nonRVs.videoHeight = evt.target.videoHeight;
        boxHeight.value = Math.floor(boxWidth.value * nonRVs.videoHeight / nonRVs.videoWidth);
        nonRVs.loadProgress++;
    }
    
    function onVideoCanPlay(evt){
        evt.target.play().catch(globalEmptyShell);
        nonRVs.loadProgress++;
    }
    
    function loadCompleteCallback(cb){
        //console.log(nonRVs)
        if(nonRVs.loadProgress === 2){
            //console.log("再延迟一点时间…");
            nonRVs.loadProgress++;
        } else if(nonRVs.loadProgress >= 3){
            clearInterval(nonRVs.timerID);
            
            const ctx = canvasRef.value.getContext("2d");
            ctx.fillRect(0, 0, boxWidth.value, boxHeight.value);
            ctx.drawImage(videoRef.value, 0, 0, boxWidth.value, boxHeight.value);
            cb({
                base64Src: canvasRef.value.toDataURL("image/jpeg", 0.8),
                videoDuration: nonRVs.videoDuration,
                videoWidth: nonRVs.videoWidth,
                videoHeight: nonRVs.videoHeight
            });
            videoSrc.value = null;
        } else {
            if((++nonRVs.tryTimes) >= 30){
                clearInterval(nonRVs.timerID);
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
        nonRVs.videoDuration = 0;
        nonRVs.videoWidth = 0;
        nonRVs.videoHeight = 0;
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
    
    onUnmounted(resetTimerID);
    
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