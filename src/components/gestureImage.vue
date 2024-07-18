<template>
    <img 
        :alt="alt" 
        :src="src"
        :style="imageStyle"
        @touchstart="onImgTouchStart"
        @touchmove="onImgTouchMove"
        @touchend="onImgTouchEnd"
        @touchcancel="onImgTouchCancel"
        @mousedown="onImgMouseDown"
        @mousemove="onImgMouseMove"
        @mouseup="onImgMouseUp"
        @mousewheel="onImgMouseWheel"
        @dblclick="onImgDblClick"
        @transitionend="onImgTransitionEnd"
        class="gti-img-box"
    />
</template>

<script setup name="GestureImage">
    import { ref, defineProps, computed } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    
    const W_W = window.innerWidth;
    const W_H = window.innerHeight;
    const MOVE_RATIO = 0.3; //移到超出范围后的粘合墙壁因子，值越小越粘。
    const INERTIA_STEP = 150; //单指移动放手后的滑动的时间（毫秒）
    const MAX_SCALE = 6.5; //双指放大时最大的放大倍数
    const MAX_SCALE_FINAL = 5; //手指离开屏幕时最终允许的最大放大倍数
    const MIN_SCALE = 0.8; //双指缩小时最小的缩小倍数
    const MIN_SCALE_FINAL = 1; //手指离开屏幕时最终允许的最小缩小倍数
    const DOUBLE_CLICK_SPAN = 300; //双击时的时间间隔
    const IMAGE_WIDTH = W_W * 1; //图片宽度
    const IMAGE_HEIGHT = W_H * 1; //图片高度
    const ORIGIN_X = 0.0; //[0 - 1] 之间的数
    const ORIGIN_Y = 0.0; //[0 - 1] 之间的数
    const MOUSE_WHEEL_SCALE_RATIO = 0.05; //鼠标滚动时放大缩小的比例
    
    const props = defineProps({
        alt: {
            type: String,
            default: ""
        },
        src: {
            type: String,
            default: ""
        }
    });
    
    const needTransition = ref(false); //是否需要动画支持
    const imageScale = ref(1); //图像缩放大小
    const transXY = ref([0, 0]); //图像偏移量
    const cursorType = ref("initial"); //鼠标光标类型
    const maxScaleFinalXY = [0, 0]; //刚好达到 “MAX_SCALE_FINAL” 时的偏移量
    const moveXY = [0, 0]; //单指移动时的位置，或者双指移动时的双指中心位置
    
    const imageStyle = computed(() => ({
        transition: (needTransition.value ? "transform 300ms ease-out 0s" : "none"),
        transformOrigin: `${ORIGIN_X * 100}% ${ORIGIN_Y * 100}%`,
        transform: `translate(${transXY.value[0]}px, ${transXY.value[1]}px) scale(${imageScale.value})`,
        cursor: cursorType.value
    }));
    const scaleOffset = computed(() => (imageScale.value - 1)); //缩放大小偏移量
    const limitMinX = computed(() => Math.round(IMAGE_WIDTH * (ORIGIN_X - 1) * scaleOffset.value)); //负数
    const limitMaxX = computed(() => Math.round(IMAGE_WIDTH * ORIGIN_X * scaleOffset.value));
    const limitMinY = computed(() => Math.round(IMAGE_HEIGHT * (ORIGIN_Y - 1) * scaleOffset.value)); //负数
    const limitMaxY = computed(() => Math.round(IMAGE_HEIGHT * ORIGIN_Y * scaleOffset.value));
    
    function getNumberBetween(num, min, max){//介于两个数之间的数
        if(num < min){
            return min;
        } else if(num > max){
            return max;
        } else {
            return num;
        }
    };
    function getDisPx(evt){//两指之间的距离（像素）
        const dis = Math.hypot(
            evt.touches[1].clientX - evt.touches[0].clientX,
            evt.touches[1].clientY - evt.touches[0].clientY
        );
        return Math.max(dis, 1); //至少一像素
    };
    function getCenterXY(evt){//两指间的中心点（相对于元素左上角的点，像素）
        return [
            (evt.touches[0].clientX + evt.touches[1].clientX) / 2 - evt.target.offsetLeft,
            (evt.touches[0].clientY + evt.touches[1].clientY) / 2 - evt.target.offsetTop
        ];
    };
    function getFingerXY(evt){//获取单指触控点的相对于元素左上角的点
        //注意：[clientX, clientY] 是相对于屏幕左上角的点，而非相对于元素左上角
        return [
            evt.touches[0].clientX - evt.target.offsetLeft,
            evt.touches[0].clientY - evt.target.offsetTop,
        ];
    };
    function getTransXY(evt){//获取双击时的偏移量
        if(evt.type === "touchstart"){
            return [
                -(evt.touches[0].clientX - evt.target.offsetLeft - IMAGE_WIDTH * ORIGIN_X) * scaleOffset.value,
                -(evt.touches[0].clientY - evt.target.offsetTop - IMAGE_HEIGHT * ORIGIN_Y) * scaleOffset.value,
            ];
        } else {
            return [
                -(evt.offsetX - IMAGE_WIDTH * ORIGIN_X) * scaleOffset.value,
                -(evt.offsetY - IMAGE_HEIGHT * ORIGIN_Y) * scaleOffset.value,
            ];
        }
    };
    
    function onImgTouchStart(evt){
        console.log("触控开始…", evt);
    }
    function onImgTouchMove(evt){
        console.log("触控移到…", evt);
    }
    function onImgTouchEnd(evt){
        console.log("触控结束…", evt);
    }
    function onImgTouchCancel(evt){
        console.log("触控取消…", evt);
    }
    function onImgMouseDown(evt){
        console.log("鼠标按下…", evt);
    }
    function onImgMouseMove(evt){
        //console.log("鼠标移到…", evt);
    }
    function onImgMouseUp(evt){
        console.log("鼠标松开…", evt);
    }
    function onImgMouseWheel(evt){
        console.log("鼠标滚动…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        //滚轮逆时针滚动-放大；滚轮顺时针滚动-缩小
        const multiplier = (evt.wheelDelta > 0 ? +1: -1) * (MOUSE_WHEEL_SCALE_RATIO  * imageScale.value);
        const nowScale = (imageScale.value + multiplier);
        if(nowScale >= MIN_SCALE && nowScale <= MAX_SCALE){
            imageScale.value = nowScale;
            transXY.value[0] -= (evt.offsetX * multiplier);
            transXY.value[1] -= (evt.offsetY * multiplier);
        }
        console.log(nowScale)
        //记录这个点的偏移量，后面还原时有用！
        if(nowScale >= MAX_SCALE_FINAL && !maxScaleFinalXY[0] && !maxScaleFinalXY[1]){
            maxScaleFinalXY[0] = -evt.offsetX * (MAX_SCALE_FINAL - 1);
            maxScaleFinalXY[1] = -evt.offsetY * (MAX_SCALE_FINAL - 1);
        }
        
        cursorType.value = (evt.wheelDelta > 0 ? "zoom-in" : "zoom-out");
        
        needDebounce(scaleEndCallback, 500);
    }
    function onImgDblClick(evt){
        //console.log("双击…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = true;
        imageScale.value = (imageScale.value !== 1 ? 1 : 2);
        transXY.value = getTransXY(evt);
    }
    function onImgTransitionEnd(evt){
        //console.log("过渡结束…",evt)
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = false;
        maxScaleFinalXY[0] = 0;
        maxScaleFinalXY[1] = 0;
    };
    
    //缩放结束后的回调
    function scaleEndCallback(){
        if(imageScale.value < MIN_SCALE_FINAL){//松手后缩放超过最小值自动还原
            needTransition.value = true;
            transXY.value = [0, 0]
            imageScale.value = MIN_SCALE_FINAL;
        } else if(imageScale.value > MAX_SCALE_FINAL){//松手后如果缩放超过最大值自动还原
            needTransition.value = true;
            transXY.value = [...maxScaleFinalXY]
            imageScale.value = MAX_SCALE_FINAL;
        }
        cursorType.value = "initial";
    }
</script>

<style>
    .gti-img-box{
        width: 100%;
        height: auto;
    }
</style>