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
        @load="onImgLoad"
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
    const ORIGIN_X = 0.0; //[0 - 1] 之间的数
    const ORIGIN_Y = 0.0; //[0 - 1] 之间的数
    const MOUSE_WHEEL_SCALE_RATIO = 0.05; //鼠标滚动时放大缩小的比例
    const VELOCITY_THRESHOLD = 1; //移到时超过这个数据会启动惯性继续移到一段距离
    
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
    const imageWidth = ref(window.innerWidth); //图片宽度
    const imageHeight = ref(window.innerHeight); //图片高度
    const needTransition = ref(false); //是否需要动画支持
    const imageScale = ref(1); //图像缩放大小
    const cursorType = ref("grab"); //鼠标光标类型
    const transXY = reactive([0, 0]); //图像偏移量

    const maxScaleFinalXY = [0, 0, 0]; //刚好达到 “MAX_SCALE_FINAL” 时的偏移量（第一、二元素，第三个元素用于标记是否已被设置值）
    const moveXY = [0, 0]; //单指移动时的位置，或者双指移动时的双指中心位置
    const moveVelocityXY = [0, 0]; //移到时的速度
    //非响应式变量（Non responsive variables）
    const nonRVs = {
        lastDIS: 0, //双指移到时的前一次距离
        moveTS: 0, //移动时的时间戳
        startTS: 0, //开始触摸时的时间戳
    };
    
    const imageStyle = computed(() => ({
        transition: (needTransition.value ? "transform 300ms ease-out 0s" : "none"),
        transformOrigin: `${ORIGIN_X * 100}% ${ORIGIN_Y * 100}%`,
        transform: `translate(${transXY[0]}px, ${transXY[1]}px) scale(${imageScale.value})`,
        cursor: cursorType.value
    }));
    const scaleOffset = computed(() => (imageScale.value - 1)); //缩放大小偏移量
    const limitMinX = computed(() => Math.round(imageWidth.value * (ORIGIN_X - 1) * scaleOffset.value)); //负数
    const limitMaxX = computed(() => Math.round(imageWidth.value * ORIGIN_X * scaleOffset.value));
    const limitMinY = computed(() => Math.round(imageHeight.value * (ORIGIN_Y - 1) * scaleOffset.value)); //负数
    const limitMaxY = computed(() => Math.round(imageHeight.value * ORIGIN_Y * scaleOffset.value));
    
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
                -(evt.touches[0].clientX - evt.target.offsetLeft - imageWidth.value * ORIGIN_X) * scaleOffset.value,
                -(evt.touches[0].clientY - evt.target.offsetTop - imageHeight.value * ORIGIN_Y) * scaleOffset.value,
            ];
        } else {
            return [
                -(evt.offsetX - imageWidth.value * ORIGIN_X) * scaleOffset.value,
                -(evt.offsetY - imageHeight.value * ORIGIN_Y) * scaleOffset.value,
            ];
        }
    };
    function resetXY(arr, xy){//重置设置数组值
        if(!xy || !xy.length){
            arr[0] = 0;
            arr[1] = 0;
        } else if(xy.length === 1) {
            arr[0] = xy[0];
            arr[1] = xy[0];
        } else {
            arr[0] = xy[0];
            arr[1] = xy[1];
        }
    }
    
    function onImgTouchStart(evt){
        console.log("触控开始…", evt);
        
        if(evt.touches.length === 1){//单指操作
            resetXY(moveXY, getFingerXY(evt));
            if((evt.timeStamp - nonRVs.startTS) < DOUBLE_CLICK_SPAN){
                onImgDblClick(evt);
            }
        } else if(evt.touches.length === 2){//双指操作
            resetXY(moveXY, getCenterXY(evt));
            nonRVs.lastDIS = getDisPx(evt);
        }
        
        nonRVs.moveTS = nonRVs.startTS = evt.timeStamp;
    }
    function onImgTouchMove(evt){
        evt.preventDefault();
        evt.stopPropagation();
        
        console.log("触控移到…", evt);
        if(evt.touches.length === 1){//单指移到
            const nowXY = getFingerXY(evt);
            const disX = (nowXY[0] - moveXY[0]);
            const disY = (nowXY[1] - moveXY[1]);
            const disTS = Math.max(evt.timeStamp - nonRVs.moveTS, 1);// 不能小于 1，防止除以 0
            
            if(transXY[0] > 0 || transXY[0] < limitMinX.value){
                transXY[0] += (disX * MOVE_RATIO);
            } else {
                transXY[0] += (disX);
            }
            
            if(transXY[1] > 0 || transXY[1] < limitMinY.value){
                transXY[1] += (disY * MOVE_RATIO);
            } else {
                transXY[1] += (disY);
            }
            
            resetXY(moveXY, nowXY);
            resetXY(moveVelocityXY, [(disX / disTS), (disY / disTS)]);

            if(disX || disY){
                nonRVs.startTS = 0; //即使有微小的移动也要重置此时间戳！
            }
        } else if(evt.touches.length === 2){//双指缩放
            const disPx = getDisPx(evt);
            const pointerCenterXY = getCenterXY(evt);
            const oldScale = imageScale.value;
            const deltaRatio = (disPx / nonRVs.lastDIS - 1);//大于0放大（双指展开），小于0缩小（双指收缩）
            const newScale = (oldScale + deltaRatio);
            
            //双指放大时的偏移量（累加）公式参见：https://juejin.cn/post/7020243158529212423
            if(newScale >= MIN_SCALE && newScale <= MAX_SCALE){
                const deltaX = (pointerCenterXY[0] - transXY[0]) / oldScale - imageWidth.value * ORIGIN_X;
                const deltaY = (pointerCenterXY[1] - transXY[1]) / oldScale - imageHeight.value * ORIGIN_Y;
                const oldTrans = [...transXY];
                
                transXY[0] -= ((deltaRatio * deltaX) - (pointerCenterXY[0] - moveXY[0]));
                transXY[1] -= ((deltaRatio * deltaY) - (pointerCenterXY[1] - moveXY[1]));
                
                //记录这个点的偏移量，后面还原时有用！
                if(newScale >= MAX_SCALE_FINAL && !maxScaleFinalXY[2]){
                    maxScaleFinalXY[0] = (oldTrans[0] - deltaX * (MAX_SCALE_FINAL - oldScale));
                    maxScaleFinalXY[1] = (oldTrans[1] - deltaY * (MAX_SCALE_FINAL - oldScale));
                    maxScaleFinalXY[2] = 0x717; //标记为已设置值
                }
            }
            
            //根据双指收缩展开或的距离缩放（累加）
            imageScale.value = getNumberBetween(newScale, MIN_SCALE, MAX_SCALE);
            nonRVs.lastDIS = disPx;
            resetXY(moveXY, pointerCenterXY);
        }
        
        nonRVs.moveTS = evt.timeStamp;
    }
    function onImgTouchEnd(evt){
        console.log("触控结束…", evt);
        //屏幕上一个手指都没有的时候才处理
        if(evt.touches.length <= 0){
            actionEndCallback();
        } else {
            resetXY(moveXY, getFingerXY(evt));
        }
    }
    function onImgTouchCancel(evt){
        console.log("触控取消…", evt);
    }
    function onImgMouseDown(evt){
        //console.log("鼠标按下…", evt);
        resetXY(moveXY, [0x88]); //设为非零数即可！！！
        nonRVs.moveTS = evt.timeStamp; //属性返回一个毫秒时间戳，表示事件发生的时间。它是相对于网页加载成功开始计算的。
    }
    function onImgMouseMove(evt){
        //console.log("鼠标移到…", evt);
        if(moveXY[0] && moveXY[1]){//鼠标按下时才处理
            evt.preventDefault();
            evt.stopPropagation();
            
            const disTS = Math.max(evt.timeStamp - nonRVs.moveTS, 1); // 不能小于 1，防止除以 0
            
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
            moveVelocityXY[0] = (evt.movementX / disTS);
            moveVelocityXY[1] = (evt.movementY / disTS);
            nonRVs.moveTS = evt.timeStamp; //属性返回一个毫秒时间戳，表示事件发生的时间。它是相对于网页加载成功开始计算的。
        }
    }
    function onImgMouseUp(evt){
        //console.log("鼠标松开…", evt);
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
        //console.log("鼠标滚动…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        //滚轮逆时针滚动-放大；滚轮顺时针滚动-缩小
        const oldScale = imageScale.value;
        const multiplier = (evt.wheelDelta > 0 ? +MOUSE_WHEEL_SCALE_RATIO: -MOUSE_WHEEL_SCALE_RATIO) * oldScale;
        const newScale = (oldScale + multiplier);
        
        if(newScale >= MIN_SCALE && newScale <= MAX_SCALE){
            const deltaX = (evt.offsetX - imageWidth.value * ORIGIN_X);
            const deltaY = (evt.offsetY - imageHeight.value * ORIGIN_Y);
            const oldTrans = [...transXY];
            
            imageScale.value = newScale;
            transXY[0] -= (deltaX * multiplier);
            transXY[1] -= (deltaY * multiplier);
            
            //记录缩放到这个点时的偏移量，后面还原时有用！
            if(newScale >= MAX_SCALE_FINAL && !maxScaleFinalXY[2]){
                maxScaleFinalXY[0] = (oldTrans[0] - deltaX * (MAX_SCALE_FINAL - oldScale));
                maxScaleFinalXY[1] = (oldTrans[1] - deltaY * (MAX_SCALE_FINAL - oldScale));
                maxScaleFinalXY[2] = 0x717; //标记为已设置值
            }
            
            cursorType.value = (evt.wheelDelta > 0 ? "zoom-in" : "zoom-out");
        }
        
        needDebounce(actionEndCallback, 300);
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
        //console.log("过渡结束…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = false;
        maxScaleFinalXY[2] = 0; //标记为未设置值
        
        resetXY(moveVelocityXY);
    };
    function onImgLoad(evt){
        //console.log("图片加载完成…", evt.target);
        imageWidth.value = evt.target.width;
        imageHeight.value = evt.target.height;
    }
    
    //操作结束后的回调
    function actionEndCallback(){
        if(imageScale.value < MIN_SCALE_FINAL){//松手后缩放超过最小值自动还原
            needTransition.value = true;
            imageScale.value = MIN_SCALE_FINAL;
            resetXY(transXY);
        } else if(imageScale.value > MAX_SCALE_FINAL){//松手后如果缩放超过最大值自动还原
            needTransition.value = true;
            imageScale.value = MAX_SCALE_FINAL;
            resetXY(transXY, maxScaleFinalXY);
        }
        
        if(transXY[0] > limitMaxX.value){//松手后左边自动回位
            needTransition.value = true;
            transXY[0] = limitMaxX.value;
        } else if(transXY[0] < limitMinX.value){//松手后右边自动回位
            needTransition.value = true;
            transXY[0] = limitMinX.value;
        } else if(Math.abs(moveVelocityXY[0]) >= VELOCITY_THRESHOLD){ //松手后模拟惯性滑动一段距离，数值有负有正
            needTransition.value = true;
            transXY[0] = getNumberBetween(transXY[0] + moveVelocityXY[0] * INERTIA_STEP, limitMinX.value, limitMaxX.value);
        }
        
        if(transXY[1] > limitMaxY.value){//松手后顶部自动回位
            needTransition.value = true;
            transXY[1] = limitMaxY.value;
        } else if(transXY[1] < limitMinY.value){//松手后顶部自定回位
            needTransition.value = true;
            transXY[1] = limitMinY.value;
        } else if(Math.abs(moveVelocityXY[1]) >= VELOCITY_THRESHOLD){//松手后模拟惯性滑动一段距离，数值有负有正
            needTransition.value = true;
            transXY[1] = getNumberBetween(transXY[1] + moveVelocityXY[1] * INERTIA_STEP, limitMinY.value, limitMaxY.value);
        }
        
        cursorType.value = "grab";
    }
</script>

<style>
    .gti-img-box{
        width: 100%;
        height: auto;
        user-select: none;
    }
</style>