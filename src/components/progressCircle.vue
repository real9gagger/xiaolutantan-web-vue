<template>
    <svg v-if="realProgress !== uploadStatusCode.unactived" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="pgc-container" viewBox="0 0 100 100">
        <circle fill="none" r="30" cy="50" cx="50" class="pgc-circle" stroke-linecap="round" 
            :stroke="realFillColor"
            :stroke-width="realProgress === uploadStatusCode.waiting ? 0 : 4" 
            :stroke-dashoffset="CIRCLE_STROKE_DASHARRAY / 4"
            :stroke-dasharray="`${realDasharray} ${CIRCLE_STROKE_DASHARRAY - realDasharray}`" />
        <path v-if="realProgress === uploadStatusCode.failed" :fill="realFillColor" d="M48.801,53c0.122,0.663,0.758,1.102,1.42,0.98c0.499-0.092,0.889-0.481,0.98-0.98l0.8-11
        	c-0.002-1.104-0.896-1.998-2-2c-1.135,0.028-2.032,0.971-2.004,2.106c0,0.032,0.002,0.063,0.004,0.094L48.801,53z M50.001,56
        	c-1.104,0-2,0.896-2,2s0.896,2,2,2s2-0.896,2-2c0.063-1.042-0.73-1.937-1.772-2C50.153,55.995,50.077,55.995,50.001,56z" />
        <path v-else-if="realProgress === uploadStatusCode.waiting" :fill="realFillColor" d="M59.477,40.552c0.455,0,0.825,0.367,0.829,0.822c0.003,0.451-0.361,0.819-0.813,0.823l0,0h-1.668v2.259
            c0,2.627-1.651,4.875-4.045,6.004c2.394,1.118,4.045,3.377,4.045,6.004v2.26h1.651c0.454,0,0.822,0.368,0.822,0.822
            s-0.368,0.822-0.822,0.822H41.309l-0.149-0.014c-0.448-0.065-0.758-0.482-0.693-0.931c0.061-0.416,0.426-0.718,0.845-0.701h1.665
            v-2.259c0-2.627,1.649-4.875,4.045-6.004c-2.396-1.118-4.045-3.377-4.045-6.004v-2.26h-1.665c-0.454,0-0.822-0.368-0.822-0.822
            c0-0.454,0.368-0.822,0.822-0.822l0,0H59.477z M56.174,42.197H44.623v2.247c0,1.957,1.233,3.757,3.133,4.662
            c0.575,0.302,0.903,0.829,0.903,1.354c0.017,0.598-0.346,1.14-0.903,1.354c-1.888,0.906-3.133,2.706-3.131,4.662v2.27h0.92v-0.958
            c0-1.767,0.651-3.704,2.669-4.881l0.33-0.181c0.754-0.325,1.371-1.014,1.852-2.064c0.38,0.974,1.024,1.661,1.935,2.064
            c2.478,1.28,2.868,3.203,2.868,5.062v0.957h0.977v-2.257c0-1.957-1.232-3.757-3.131-4.663c-0.575-0.303-0.903-0.827-0.903-1.355
            c0-0.603,0.328-1.127,0.903-1.352c1.887-0.903,3.131-2.704,3.131-4.662V42.197L56.174,42.197z M55.026,45.506
            c0,1.073-1.321,2.275-2.554,2.786c-0.735,0.305-1.43,0.88-2.079,1.724c-0.614-0.844-1.288-1.418-2.016-1.724
            c-1.316-0.551-2.443-1.656-2.443-2.786H55.026z" />
        <path v-else-if="realProgress === uploadStatusCode.success" :fill="realFillColor" d="M47.491,57.367c-0.303,0-0.594-0.113-0.814-0.318l-6.268-5.846c-0.469-0.437-0.485-1.163-0.037-1.621
            c0.449-0.458,1.196-0.472,1.665-0.035l5.353,4.992l9.708-11.489c0.414-0.488,1.156-0.56,1.658-0.157
            c0.501,0.402,0.573,1.124,0.161,1.614L48.402,56.951c-0.208,0.248-0.513,0.397-0.839,0.416H47.491z" />
        <text v-else x="50" y="50" :fill="realFillColor" font-size="12" text-anchor="middle" dominant-baseline="central">{{realProgress}}%</text>
    </svg>
</template>

<script setup name="ProgressCircle">
    import { nextTick, ref, watch } from "vue";
    import { uploadStatusCode } from "@/assets/data/constants.js";
    
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
    const realFillColor = ref("#FFF");
    
    function updateProgress(newVal){
        if(newVal >= 100){
            realDasharray.value = CIRCLE_STROKE_DASHARRAY;
            realProgress.value = 100;
            realFillColor.value = "#FFF";
        } else if(newVal < 0){
            realDasharray.value = CIRCLE_STROKE_DASHARRAY;
            realProgress.value = newVal;
            realFillColor.value = "#F00";
        } else {
            realDasharray.value = Math.round(newVal / 100 * CIRCLE_STROKE_DASHARRAY);
            realProgress.value = Math.round(props.value);
            realFillColor.value = "#FFF";
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