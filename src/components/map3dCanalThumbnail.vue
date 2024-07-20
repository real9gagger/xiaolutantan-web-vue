<template>
    <div v-if="isShowing" class="mct-view-container" 
        :style="divStyle"
        @touchstart="onBoxPointerDown"
        @touchmove="onBoxPointerMove"
        @touchend="onBoxPointerUp"
        @transitionend="onBoxTransitionEnd"
    >
        <a class="mct-view-close" @click="toggleShowing"></a>
        <img ref="imgBox" class="mct-view-pin" :src="publicAssets.iconMyLocation" :style="imgStyle" />
    </div>
</template>

<script setup name="Map3DCanalThumbnail">
    import { nextTick, defineProps, getCurrentInstance, computed, reactive, ref } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const props = defineProps({
        picLng: {
            type: Number,
            default: 0
        },
        picLat: {
            type: Number,
            default: 0
        }
    });
    const $instance = getCurrentInstance();
    
    const southWestLnglat = ([108.40466648088292, 21.452630195172333]); //西南角经纬度
    const northEastLnglat = ([109.21613881618927, 22.963278412387110]); //东北角经纬度
    const movementXY = [0, 0]; //单指移动时的位置
    const limitXM = [0, 0]; //可滑动的 minX ~ maxX
    const limitYM = [0, 0]; //可滑动的 minY ~ maxY
    
    const BOX_MARGIN_PX = 10; //距离屏幕边缘的像素
    
    const isShowing = ref(true);
    const needTransition = ref(false); //是否需要动画支持
    const boxRect = reactive({
        boxWidth: 0,
        boxHeight: 0,
        imgWidth: 0,
        imgHeight: 0,
        pxPerLnglatX: 0,
        pxPerLnglatY: 0,
    });
    const posXY = reactive([BOX_MARGIN_PX, BOX_MARGIN_PX]);
    const divStyle = computed(() => ({
        transition: (needTransition.value ? "transform 200ms ease-out 0s" : "none"),
        transform: `translate(${posXY[0]}px, ${posXY[1]}px)`,
    }));
    const imgStyle = computed(() => ({
        left: Math.round((props.picLng - southWestLnglat[0]) * boxRect.pxPerLnglatX - boxRect.imgWidth / 2) + "px",
        top: Math.round((props.picLat - northEastLnglat[1]) * boxRect.pxPerLnglatY - boxRect.imgHeight) + "px",
    }));
    
    function getNumberBetween(num, min, max){//介于两个数之间的数
        if(num < min){
            return min;
        } else if(num > max){
            return max;
        } else {
            return num;
        }
    }
    function toggleShowing(){
        isShowing.value = !isShowing.value;
    }
    function onBoxPointerDown(evt){
        console.log("指针按下…", evt);
        const canMove = (evt.touches.length === 1);
        movementXY[0] = (canMove ? evt.touches[0].clientX : 0);
        movementXY[1] = (canMove ? evt.touches[0].clientY : 0);
    }
    function onBoxPointerMove(evt){
        console.log("指针移到…", evt);
        if(movementXY[0] || movementXY[1]){
            const cXY = [
                evt.touches[0].clientX,
                evt.touches[0].clientY
            ];
            posXY[0] = getNumberBetween(posXY[0] + cXY[0] - movementXY[0], limitXM[0], limitXM[1]);
            posXY[1] = getNumberBetween(posXY[1] + cXY[1] - movementXY[1], limitYM[0], limitYM[1]);
            movementXY[0] = cXY[0];
            movementXY[1] = cXY[1];
        }
    }
    function onBoxPointerUp(evt){
        console.log("指针松开…", evt);
        if(movementXY[0] || movementXY[1]){
            const wiw = window.innerWidth;
            const wih = window.innerHeight;
            
            needTransition.value = true;
            
            posXY[0] = (posXY[0] > (wiw / 2) ? (wiw - boxRect.boxWidth - BOX_MARGIN_PX) : BOX_MARGIN_PX);
            posXY[1] = getNumberBetween(posXY[1], BOX_MARGIN_PX, wih - boxRect.boxHeight - BOX_MARGIN_PX);
            
            movementXY[0] = 0;
            movementXY[1] = 0;
        }
    }
    function onImgTransitionEnd(evt){
        //console.log("过渡结束…", evt);
        needTransition.value = false;
    }
    
    nextTick(() => {
        boxRect.boxWidth = $instance.proxy.$el.clientWidth;
        boxRect.boxHeight = $instance.proxy.$el.clientHeight;
        boxRect.imgWidth = $instance.refs.imgBox.clientWidth;
        boxRect.imgHeight = $instance.refs.imgBox.clientHeight;
        boxRect.pxPerLnglatX = boxRect.boxWidth / (northEastLnglat[0] - southWestLnglat[0]);
        boxRect.pxPerLnglatY = boxRect.boxHeight / (southWestLnglat[1] - northEastLnglat[1]);
        
        limitXM[1] = (window.innerWidth - boxRect.boxWidth);
        limitYM[1] = (window.innerHeight - boxRect.boxHeight);
    });
</script>

<style>
    .mct-view-container{
        position: fixed;
        left: 0;
        top: 0;
        z-index: 8888;
        width: 5rem;
        height: 10rem;
        background-position: 0% 0%;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-image: var(--bg-map-canal-thumbnail);
        box-shadow: 0 0 0.5rem 0 #ccc;
        border-radius: 0.5rem;
    }
    .mct-view-pin{
        display: block;
        width: 1rem;
        height: 1rem;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
    }
    .mct-view-close{
        display: block;
        position: absolute;
        inset: 0.2rem 0.2rem auto auto;
        width: 0.8rem;
        height: 0.8rem;
        padding: 0.1rem;
        z-index: 8;
        background-position: 0% 0%;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-image: var(--bg-close-x-grey);
        opacity: 0.5;
    }
</style>