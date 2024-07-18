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
        @mouseleave="onImgMouseLeave"
        @mousewheel="onImgMouseWheel"
        @dblclick="onImgDblClick"
        @transitionend="onImgTransitionEnd"
        class="gti-img-box"
        draggable="false"
    />
</template>

<script setup name="GestureImage">
    import { ref, reactive, defineProps, computed } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    
    const MOVE_RATIO = 0.3; //移到超出范围后的粘合墙壁因子，值越小越粘。
    const INERTIA_STEP = 150; //单指移动放手后的滑动的时间（毫秒）
    const MAX_SCALE = 6.5; //双指放大时最大的放大倍数
    const MAX_SCALE_FINAL = 5; //手指离开屏幕时最终允许的最大放大倍数
    const MIN_SCALE = 0.8; //双指缩小时最小的缩小倍数
    const MIN_SCALE_FINAL = 1; //手指离开屏幕时最终允许的最小缩小倍数
    const DOUBLE_CLICK_SPAN = 300; //双击时的时间间隔
    const IMAGE_WIDTH = Math.min(window.innerWidth, 600); //图片宽度
    const IMAGE_HEIGHT = Math.round(window.innerHeight * 0.8); //图片高度
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
    const cursorType = ref("initial"); //鼠标光标类型
    const transXY = reactive([0, 0]); //图像偏移量
    const maxScaleFinalXY = [0, 0]; //刚好达到 “MAX_SCALE_FINAL” 时的偏移量
    const moveXY = [0, 0]; //单指移动时的位置，或者双指移动时的双指中心位置
    const moveVelocityXY = [0, 0]; //移到时的速度
    
    const imageStyle = computed(() => ({
        transition: (needTransition.value ? "transform 300ms ease-out 0s" : "none"),
        transformOrigin: `${ORIGIN_X * 100}% ${ORIGIN_Y * 100}%`,
        transform: `translate(${transXY[0]}px, ${transXY[1]}px) scale(${imageScale.value})`,
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
    function resetXY(arr, xy){//重置设置数组值
        if(!xy || xy.length !== 2){
            arr[0] = 0;
            arr[1] = 0;
        } else {
            arr[0] = xy[0];
            arr[1] = xy[1];
        }
    }
    
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
        resetXY(moveXY, [0x88, 0x88]); //设为非零数即可！！！
        cursorType.value = "grab";
    }
    function onImgMouseMove(evt){
        //console.log("鼠标移到…", evt);
        if(moveXY[0] && moveXY[1]){//鼠标按下时才处理
            if(transXY[0] > 0 || transXY[0] < limitMinX.value){
                transXY[0] += (evt.movementX * MOVE_RATIO);
            } else {
                transXY[0] += (evt.movementX);
            }
            
            if(transXY[1] > 0 || transXY[1] < limitMinY.value){
                transXY[1] += (evt.movementY * MOVE_RATIO);
            } else {
                transXY[1] += (evt.movementY);
            }
        }
    }
    function onImgMouseUp(evt){
        console.log("鼠标松开…", evt);
        resetXY(moveXY);
        actionEndCallback();
    }
    function onImgMouseLeave(evt){
        //console.log("鼠标离开…", evt);
        if(moveXY[0] && moveXY[1]){//鼠标按下时才处理
            resetXY(moveXY);
            actionEndCallback();
        }
    }
    function onImgMouseWheel(evt){
        console.log("鼠标滚动…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        //console.log(evt.offsetX, " = ", (evt.layerX - transXY[0]) / imageScale.value);
        //console.log(evt.offsetY, " = ", (evt.layerY - transXY[1]) / imageScale.value);
        //滚轮逆时针滚动-放大；滚轮顺时针滚动-缩小
        const oldScale = imageScale.value;
        const multiplier = (evt.wheelDelta > 0 ? +1: -1) * (MOUSE_WHEEL_SCALE_RATIO  * imageScale.value);
        const nowScale = (imageScale.value + multiplier);
        const xxxx = [...transXY];
        
        if(nowScale >= MIN_SCALE && nowScale <= MAX_SCALE){
            imageScale.value = nowScale;
            transXY[0] -= (evt.offsetX * multiplier);
            transXY[1] -= (evt.offsetY * multiplier);
        }
        
        //记录这个点的偏移量，后面还原时有用！
        //if(nowScale >= MAX_SCALE_FINAL && !maxScaleFinalXY[0] && !maxScaleFinalXY[1]){
            //公式一
            //maxScaleFinalXY[0] = transXY[0] * (2 - nowScale/MAX_SCALE_FINAL);
            //maxScaleFinalXY[1] = transXY[1] * (2 - nowScale/MAX_SCALE_FINAL);
            
            //公式二
            //maxScaleFinalXY[0] = (evt.layerX / (nowScale-1) + transXY[0]);
            //maxScaleFinalXY[1] = (evt.layerY / (nowScale-1) + transXY[1]);
            
            //公式三
            //maxScaleFinalXY[0] = xxxx[0] - evt.offsetX *(MAX_SCALE_FINAL-oldScale);
            //maxScaleFinalXY[1] = xxxx[1] - evt.offsetY *(MAX_SCALE_FINAL-oldScale);
            
            //公式四
            maxScaleFinalXY[0] = transXY[0] - evt.offsetX * (MAX_SCALE_FINAL - nowScale);
            maxScaleFinalXY[1] = transXY[1] - evt.offsetY * (MAX_SCALE_FINAL - nowScale)
            console.log(nowScale,MAX_SCALE_FINAL, transXY, maxScaleFinalXY);
            
        //}
        cursorType.value = (evt.wheelDelta > 0 ? "zoom-in" : "zoom-out");
        
        needDebounce(actionEndCallback, 200);
    }
    function onImgDblClick(evt){
        //console.log("双击…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = true;
        imageScale.value = (imageScale.value !== 1 ? 1 : 2);
        resetXY(transXY, getTransXY(evt));
    }
    function onImgTransitionEnd(evt){
        //console.log("过渡结束…",evt)
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = false;
        resetXY(maxScaleFinalXY);
    };
    
    //操作结束后的回调
    function actionEndCallback(){
        if(transXY[0] > limitMaxX.value){//松手后左边自动回位
            needTransition.value = true;
            transXY[0] = limitMaxX.value;
        } else if(transXY[0] < limitMinX.value){//松手后右边自动回位
            needTransition.value = true;
            transXY[0] = limitMinX.value;
        } else if(Math.abs(moveVelocityXY[0]) >= 1){ //松手后模拟惯性滑动一段距离，数值有负有正
            needTransition.value = true;
            transXY[0] = getNumberBetween(transXY[0] + moveVelocityXY[0] * INERTIA_STEP, limitMinX.value, limitMaxX.value);
        }
        
        if(transXY[1] > limitMaxY.value){//松手后顶部自动回位
            needTransition.value = true;
            transXY[1] = limitMaxY.value;
        } else if(transXY[1] < limitMinY.value){//松手后顶部自定回位
            needTransition.value = true;
            transXY[1] = limitMinY.value;
        } else if(Math.abs(moveVelocityXY[1]) >= 1){//松手后模拟惯性滑动一段距离，数值有负有正
            needTransition.value = true;
            transXY[1] = getNumberBetween(transXY[1] + moveVelocityXY[1] * INERTIA_STEP, limitMinY.value, limitMaxY.value);
        }
        
        if(imageScale.value < MIN_SCALE_FINAL){//松手后缩放超过最小值自动还原
            needTransition.value = true;
            imageScale.value = MIN_SCALE_FINAL;
            resetXY(transXY);
        } else if(imageScale.value > MAX_SCALE_FINAL){//松手后如果缩放超过最大值自动还原
            needTransition.value = true;
            imageScale.value = MAX_SCALE_FINAL;
            resetXY(transXY, maxScaleFinalXY);
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