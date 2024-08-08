<template>
    <svg v-if="realProgress > 0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="pgc-container" viewBox="0 0 100 100">
        <circle 
            fill="none" 
            stroke-linecap="round" 
            stroke="#FFF" 
            stroke-width="4" 
            :stroke-dashoffset="CIRCLE_STROKE_DASHARRAY / 4"
            :stroke-dasharray="`${realDasharray} ${CIRCLE_STROKE_DASHARRAY - realDasharray}`"
            r="30" 
            cy="50" 
            cx="50"
            class="pgc-circle" />
        <text x="50" y="50" fill="white" font-size="12" text-anchor="middle" dominant-baseline="central">{{realProgress}}%</text>
    </svg>
</template>

<script setup name="ProgressCircle">
    import { defineProps, nextTick, ref, watch } from "vue";
    
    const CIRCLE_STROKE_DASHARRAY = Math.ceil(2 * Math.PI * 30); //值为圆的周长 = 2 * π * 半径，然后向上取整
    const props = defineProps({
        value: { /* 当前进度，取值 0~100 */
            type: Number,
            default: 0
        },
        errmsg: {//上传错误信息
            type: String,
            default: ""
        }
    });
    const realDasharray = ref(0);
    const realProgress = ref(0);
    
    function updateProgress(newVal){
        if(newVal > 100){
            realDasharray.value = CIRCLE_STROKE_DASHARRAY;
            realProgress.value = 100;
        } else if(newVal < 0){
            realDasharray.value = 0;
            realProgress.value = 0;
        } else {
            realDasharray.value = Math.round(newVal / 100 * CIRCLE_STROKE_DASHARRAY);
            realProgress.value = Math.round(props.value);
        }
    }
    
    watch(() => props.value, updateProgress);
    
    nextTick(() => updateProgress(props.value));
</script>

<style>
    .pgc-container{
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }
    .pgc-circle{
        transition: stroke-dasharray 600ms ease 0s;
    }
</style>