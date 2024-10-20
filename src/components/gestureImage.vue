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
        @click="onImgClick"
        @transitionend="onImgTransitionEnd"
        @load="onImgLoad"
        @pointermove="onPointerHandler"
        class="gti-img-box"
        draggable="false"
    />
</template>

<script setup name="GestureImage">
    import { ref, reactive, defineProps, computed } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    
    const MOVE_RATIO = 0.25; //移到超出范围后的粘合墙壁因子，值越小越粘。
    const INERTIA_STEP = 200; //单指移动放手后的滑动的时间（毫秒）
    const MAX_SCALE = { CEILING: 8, FINAL: 6 };//双指放大时最大的放大倍数；手指离开屏幕时最终允许的最大放大倍数
    const MIN_SCALE = { FLOOR: 0.8, FINAL: 1 }; //双指缩小时最小的缩小倍数；手指离开屏幕时最终允许的最小缩小倍数
    const DOUBLE_CLICK_SPAN = 300; //双击时的时间间隔
    const ORIGIN_X = 0.0; //[0 - 1] 之间的数
    const ORIGIN_Y = 0.0; //[0 - 1] 之间的数
    const ORIGIN_A = (ORIGIN_X - 1); //原点X轴值减去一
    const ORIGIN_B = (ORIGIN_Y - 1); //原点Y轴值减去一
    const MOUSE_WHEEL_SCALE_RATIO = 0.1; //鼠标滚动时放大缩小的比例
    const VELOCITY_THRESHOLD = 1; //移到时超过这个数据会启动惯性继续移到一段距离
    
    const props = defineProps({
        alt: {
            type: String,
            default: ""
        },
        src: {
            type: String,
            default: ""
        },
        threshold: {//当图片处于这个缩放值的，手势捏合、拖动事件不可用
            type: Number,
            default: 1
        },
        clickable: {
            type: Boolean,
            default: true
        }
    });
    const needTransition = ref(false); //是否需要动画支持
    const imageScale = ref(1); //图像缩放大小
    const cursorType = ref("pointer"); //鼠标光标类型
    const transXY = reactive([0, 0]); //图像偏移量
    const imageRect = reactive({//图片矩形信息
        height: 0,
        width: 0,
        offsetTop: 0, //非负数
        offsetLeft: 0, //非负数
        bestScale: 0, //最佳缩放值
        coverDirection: 0, //是水平(0x00)还是垂直方向（0xFF）铺满
    });

    const maxScaleFinalXY = [0, 0, 0]; //刚好达到 “MAX_SCALE.FINAL” 时的偏移量（第一、二元素标记位置，第三个元素用于标记是否已被设置值）
    const moveXY = [0, 0]; //单指移动时的位置，或者双指移动时的双指中心位置
    const moveVelocityXY = [0, 0]; //移到时的速度
    const nonRVs = { //非响应式变量（non Responsive Variables）
        lastDIS: 0, //双指移到时的前一次距离
        moveTS: 0, //移动时的时间戳
        startTS: 0, //开始触摸时的时间戳
        canPropagateClickEvent: true, //点击事件是否可以冒泡
        touchScaleSpeed: 1, //触控缩放速率
    };
    
    const imageStyle = computed(() => ({
        transition: (needTransition.value ? "transform 300ms ease-out 0s" : "none"),
        transformOrigin: `${ORIGIN_X * 100}% ${ORIGIN_Y * 100}%`,
        transform: `translate(${transXY[0]}px, ${transXY[1]}px) scale(${imageScale.value})`,
        width: (imageRect.width ? `${imageRect.width}px` : "100%"),
        height: (imageRect.height ? `${imageRect.height}px` : "100%"),
        objectFit: (imageRect.height ? "" : "contain"),
        cursor: cursorType.value
    }));
    const isHandleEvent = computed(() => (imageScale.value !== props.threshold)); //只有缩放不等于1才能控制触控事件，防止和 Swiper 事件冲突
    const limitArea = computed(() => {
        const scaleOffset = (imageScale.value - 1);
        const occupyX = (imageRect.width * scaleOffset / 2);
        const occupyY = (imageRect.height * scaleOffset / 2);
        const output = {
            xL: 0, //X轴左边，向X轴的右方向滑动时的限制值
            xR: 0, //X轴右边，向X轴的左方向滑动时的限制值
            yT: 0, //Y轴上边，向Y轴的下方向滑动时的限制值
            yB: 0, //Y轴下边，向Y轴的上方向滑动时的限制值
        };
        
        if(imageRect.offsetLeft >= occupyX){
            output.xL = Math.round(imageRect.width * ORIGIN_X * scaleOffset - occupyX);
            output.xR = Math.round(imageRect.width * ORIGIN_A * scaleOffset + occupyX);
        } else {
            output.xL = Math.round(imageRect.width * ORIGIN_X * scaleOffset - imageRect.offsetLeft);
            output.xR = Math.round(imageRect.width * ORIGIN_A * scaleOffset + imageRect.offsetLeft);
        }
        
        if(imageRect.offsetTop >= occupyY){
            output.yT = Math.round(imageRect.height * ORIGIN_Y * scaleOffset - occupyY);
            output.yB = Math.round(imageRect.height * ORIGIN_B * scaleOffset + occupyY);
        } else {
            output.yT = Math.round(imageRect.height * ORIGIN_Y * scaleOffset - imageRect.offsetTop);
            output.yB = Math.round(imageRect.height * ORIGIN_B * scaleOffset + imageRect.offsetTop);
        }

        return output;
    });
    
    function getNumberBetween(num, min, max){//介于两个数之间的数
        if(num < min){
            return min;
        } else if(num > max){
            return max;
        } else {
            return num;
        }
    }
    function getDisPx(evt){//两指之间的距离（像素）
        const dis = Math.hypot(
            evt.touches[1].clientX - evt.touches[0].clientX,
            evt.touches[1].clientY - evt.touches[0].clientY
        );
        return Math.max(dis, 1); //至少一像素
    }
    function getCenterXY(evt){//两指间的中心点（相对于元素左上角的点，像素）
        return [
            (evt.touches[0].clientX + evt.touches[1].clientX) / 2 - evt.target.offsetLeft,
            (evt.touches[0].clientY + evt.touches[1].clientY) / 2 - evt.target.offsetTop
        ];
    }
    function getFingerXY(evt){//获取单指触控点的相对于元素左上角的点
        //注意：[clientX, clientY] 是相对于屏幕左上角的点，而非相对于元素左上角
        return [
            evt.touches[0].clientX - evt.target.offsetLeft,
            evt.touches[0].clientY - evt.target.offsetTop,
        ];
    }
    function getTransXY(evt){//获取双击时的偏移量
        const scaleOffset = (1 - imageScale.value);
        if(evt.type === "touchstart"){
            if(imageRect.coverDirection){//垂直方向铺满
                return [
                    (imageRect.width / 2 - imageRect.width * ORIGIN_X) * scaleOffset,
                    (evt.touches[0].clientY - evt.target.offsetTop - imageRect.height * ORIGIN_Y) * scaleOffset,
                ];
            } else {//水平方向铺满
                return [
                    (evt.touches[0].clientX - evt.target.offsetLeft - imageRect.width * ORIGIN_X) * scaleOffset,
                    (imageRect.height / 2 - imageRect.height * ORIGIN_Y) * scaleOffset,
                ];
            }
        } else {
            if(imageRect.coverDirection){//垂直方向铺满
                return [
                    (imageRect.width / 2 - imageRect.width * ORIGIN_X) * scaleOffset,
                    (evt.offsetY - imageRect.height * ORIGIN_Y) * scaleOffset,
                ];
            } else {//水平方向铺满
                return [
                    (evt.offsetX - imageRect.width * ORIGIN_X) * scaleOffset,
                    (imageRect.height / 2 - imageRect.height * ORIGIN_Y) * scaleOffset,
                ];
            }
        }
    }
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
        //console.log("触控开始…", evt);
        if(evt.touches.length === 1){//单指操作
            if((evt.timeStamp - nonRVs.startTS) < DOUBLE_CLICK_SPAN){
                onImgDblClick(evt);
            }
            if(isHandleEvent.value){
                resetXY(moveXY, getFingerXY(evt));
            }
        } else if(evt.touches.length === 2){//双指操作
            if(isHandleEvent.value){
                resetXY(moveXY, getCenterXY(evt));
                nonRVs.lastDIS = getDisPx(evt);
            }
        }
        
        nonRVs.canPropagateClickEvent = true;
        nonRVs.moveTS = nonRVs.startTS = evt.timeStamp;
    }
    function onImgTouchMove(evt){
        //console.log("触控移到…", evt);
        if(!isHandleEvent.value){
            return;
        }
        
        evt.preventDefault();
        evt.stopPropagation();
        
        if(evt.touches.length === 1){//单指移到
            const nowXY = getFingerXY(evt);
            const disX = (nowXY[0] - moveXY[0]);
            const disY = (nowXY[1] - moveXY[1]);
            const disTS = Math.max(evt.timeStamp - nonRVs.moveTS, 1);// 不能小于 1，防止除以 0
            
            if(transXY[0] >= limitArea.value.xL || transXY[0] <= limitArea.value.xR){
                transXY[0] += (disX * MOVE_RATIO);
            } else {
                transXY[0] += (disX);
            }
            
            if(transXY[1] >= limitArea.value.yT || transXY[1] <= limitArea.value.yB){
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
            const deltaRatio = (disPx / nonRVs.lastDIS - 1) * nonRVs.touchScaleSpeed;//大于0放大（双指展开），小于0缩小（双指收缩）
            const newScale = (oldScale + deltaRatio);
            
            //双指放大时的偏移量（累加）公式参见：https://juejin.cn/post/7020243158529212423
            if(newScale >= MIN_SCALE.FLOOR && newScale <= MAX_SCALE.CEILING){
                //计算方式请查看，鼠标滚轮事件的 offsetX/Y 的计算方式
                const scaleOffset = (imageScale.value - 1);
                const deltaX = (pointerCenterXY[0] - transXY[0] + imageRect.width * ORIGIN_X * scaleOffset) / oldScale - imageRect.width * ORIGIN_X;
                const deltaY = (pointerCenterXY[1] - transXY[1] + imageRect.height * ORIGIN_Y * scaleOffset) / oldScale - imageRect.height * ORIGIN_Y;
                const oldTrans = [...transXY];

                transXY[0] -= ((deltaRatio * deltaX) - (pointerCenterXY[0] - moveXY[0]));
                transXY[1] -= ((deltaRatio * deltaY) - (pointerCenterXY[1] - moveXY[1]));
                
                //记录这个点的偏移量，后面还原时有用！
                if(newScale >= MAX_SCALE.FINAL && !maxScaleFinalXY[2]){
                    maxScaleFinalXY[0] = (oldTrans[0] - deltaX * (MAX_SCALE.FINAL - oldScale));
                    maxScaleFinalXY[1] = (oldTrans[1] - deltaY * (MAX_SCALE.FINAL - oldScale));
                    maxScaleFinalXY[2] = 0x717; //标记为已设置值
                }
                
                imageScale.value = newScale; //根据双指收缩展开或的距离缩放（累加）
                nonRVs.lastDIS = disPx;
            }
            
            resetXY(moveXY, pointerCenterXY);
        }
        
        nonRVs.canPropagateClickEvent = false;
        nonRVs.moveTS = evt.timeStamp;
    }
    function onImgTouchEnd(evt){
        //console.log("触控结束…", evt);
        if(!isHandleEvent.value){
            return;
        }
        
        //屏幕上一个手指都没有的时候才处理
        if(evt.touches.length <= 0){
            actionEndCallback();
        } else {
            resetXY(moveXY, getFingerXY(evt));
        }
    }
    function onImgTouchCancel(evt){
        //console.log("触控取消…", evt);
        resetXY(moveXY);
    }
    
    function onImgMouseDown(evt){
        //console.log("鼠标按下…", evt);
        if(!isHandleEvent.value){
            return;
        }
        
        //鼠标左键按下时才有效
        if(evt.button === 0){
            resetXY(moveXY, [0x88]); //设为非零数即可！！！
        }
        
        nonRVs.canPropagateClickEvent = true;
        nonRVs.moveTS = nonRVs.startTS = evt.timeStamp; //属性返回一个毫秒时间戳，表示事件发生的时间。它是相对于网页加载成功开始计算的。
    }
    function onImgMouseMove(evt){
        //console.log("鼠标移到…", evt);
        if(!isHandleEvent.value){
            return;
        }
        
        if(moveXY[0] && moveXY[1]){//鼠标按下时才处理
            evt.preventDefault();
            evt.stopPropagation();
            
            const disTS = Math.max(evt.timeStamp - nonRVs.moveTS, 1); // 不能小于 1，防止除以 0
            
            if(transXY[0] >= limitArea.value.xL || transXY[0] <= limitArea.value.xR){
                transXY[0] += (evt.movementX * MOVE_RATIO);
            } else {
                transXY[0] += (evt.movementX);
            }
            
            if(transXY[1] >= limitArea.value.yT || transXY[1] <= limitArea.value.yB){
                transXY[1] += (evt.movementY * MOVE_RATIO);
            } else {
                transXY[1] += (evt.movementY);
            }
            moveVelocityXY[0] = (evt.movementX / disTS);
            moveVelocityXY[1] = (evt.movementY / disTS);
            
            nonRVs.canPropagateClickEvent = false;
            nonRVs.moveTS = evt.timeStamp; //属性返回一个毫秒时间戳，表示事件发生的时间。它是相对于网页加载成功开始计算的。
        }
    }
    function onImgMouseUp(evt){
        //console.log("鼠标松开…", evt);
        if(!isHandleEvent.value){
            return;
        }
        
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
        if(!isHandleEvent.value){
            return;
        }
        
        evt.preventDefault();
        evt.stopPropagation();
        
        if(imageScale.value >= MIN_SCALE.FLOOR && imageScale.value <= MAX_SCALE.CEILING){
            //滚轮逆时针滚动-放大；滚轮顺时针滚动-缩小
            /* 计算公式
                offsetX = (clientX - offsetLeft - transXY[0] + imageRect.width * ORIGIN_X * (imageScale.value - 1)) / imageScale.value;
                offsetY = (clientY - offsetTop - transXY[1] + imageRect.height * ORIGIN_Y * (imageScale.value - 1)) / imageScale.value;，
                
                可以打印结果出来验证公式对不对
                console.log(
                    evt.offsetX, 
                    (evt.clientX - evt.target.offsetLeft - transXY[0] + imageRect.width * ORIGIN_X * (imageScale.value - 1)) / imageScale.value,
                    evt.offsetY,
                    (evt.clientY - evt.target.offsetTop - transXY[1] + imageRect.height * ORIGIN_Y * (imageScale.value - 1)) / imageScale.value
                );
            */
            const oldScale = imageScale.value;
            const multiplier = (evt.wheelDelta > 0 ? +MOUSE_WHEEL_SCALE_RATIO: -MOUSE_WHEEL_SCALE_RATIO) * oldScale;
            const newScale = (oldScale + multiplier);
            const deltaX = (evt.offsetX - imageRect.width * ORIGIN_X);
            const deltaY = (evt.offsetY - imageRect.height * ORIGIN_Y);
            const oldTrans = [...transXY];
            
            imageScale.value = newScale;
            transXY[0] -= (deltaX * multiplier);
            transXY[1] -= (deltaY * multiplier);
            
            //记录缩放到这个点时的偏移量，后面还原时有用！
            if(newScale >= MAX_SCALE.FINAL && !maxScaleFinalXY[2]){
                maxScaleFinalXY[0] = (oldTrans[0] - deltaX * (MAX_SCALE.FINAL - oldScale));
                maxScaleFinalXY[1] = (oldTrans[1] - deltaY * (MAX_SCALE.FINAL - oldScale));
                maxScaleFinalXY[2] = 0x717; //标记为已设置值
            }
            
            cursorType.value = (evt.wheelDelta > 0 ? "zoom-in" : "zoom-out");
        }
        
        needDebounce(actionEndCallback, 600);
    }
    function onImgDblClick(evt){
        //console.log("双击…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = true;
        imageScale.value = (imageScale.value !== 1 ? 1 : imageRect.bestScale);
        cursorType.value = (imageScale.value !== 1 ? "grab" : "pointer");
        resetXY(transXY, getTransXY(evt));
    }
    function onImgClick(evt){
        //console.log("点击…", evt);
        if(!props.clickable || !nonRVs.canPropagateClickEvent){
            evt.preventDefault();
            evt.stopPropagation();
        }
    }
    function onImgTransitionEnd(evt){
        //console.log("过渡结束…", evt);
        evt.preventDefault();
        evt.stopPropagation();
        
        needTransition.value = false;
        maxScaleFinalXY[2] = 0; //标记为未设置值
        
        resetXY(moveVelocityXY);
    }
    function onImgLoad(evt){
        //console.log("图片加载完成…", evt);
        const tg = evt.target;
        const ratio = (tg.naturalWidth / tg.naturalHeight);
        const containerHeight = tg.parentNode.clientHeight;
        const containerWidth = tg.parentNode.clientWidth;
        
        if((containerHeight * ratio) < containerWidth){
            imageRect.height = containerHeight;
            imageRect.width = Math.round(containerHeight * ratio);
            imageRect.offsetTop = 0; //必须大于或等于0
            imageRect.offsetLeft =  Math.floor((containerWidth - imageRect.width) / 2); //必须大于或等于0
            imageRect.bestScale = (containerWidth / imageRect.width);
            imageRect.coverDirection = 0xFF; //垂直方向铺满
        } else {
            imageRect.height = Math.round(containerWidth / ratio);
            imageRect.width = containerWidth;
            imageRect.offsetTop = Math.floor((containerHeight - imageRect.height) / 2); //必须大于或等于0
            imageRect.offsetLeft = 0; //必须大于或等于0
            imageRect.bestScale = (containerHeight / imageRect.height);
            imageRect.coverDirection = 0x00; //水平方向铺满
        }
        
        //决不能等于1！！！
        if(imageRect.bestScale === 1){
            imageRect.bestScale += 0.5;
        }
        
        MAX_SCALE.FINAL = Math.floor(Math.max(tg.naturalWidth / imageRect.width, imageRect.bestScale + 1)); //不能小于最佳缩放值
        MAX_SCALE.CEILING = (MAX_SCALE.FINAL + 2);
        
        nonRVs.touchScaleSpeed = Math.sqrt(MAX_SCALE.FINAL);

        //console.log(imageRect, MAX_SCALE);
    }
    function onPointerHandler(evt){
        //console.log("指针事件…", evt);
        //处理和 Swiper 滑动冲突问题！
        if(isHandleEvent.value && imageScale.value !== 1){
            //evt.preventDefault(); 不注释掉的话，图片放大后无法滑动的问题！
            evt.stopPropagation();
        }
    }
    
    //操作结束后的回调
    function actionEndCallback(){
        if(imageScale.value < MIN_SCALE.FINAL){//松手后缩放超过最小值自动还原
            needTransition.value = true;
            imageScale.value = MIN_SCALE.FINAL;
            resetXY(transXY);
        } else if(imageScale.value > MAX_SCALE.FINAL){//松手后如果缩放超过最大值自动还原
            needTransition.value = true;
            imageScale.value = MAX_SCALE.FINAL;
            resetXY(transXY, maxScaleFinalXY);
        }
        
        if(transXY[0] > limitArea.value.xL){//松手后左边自动回位
            needTransition.value = true;
            transXY[0] = limitArea.value.xL;
        } else if(transXY[0] < limitArea.value.xR){//松手后右边自动回位
            needTransition.value = true;
            transXY[0] = limitArea.value.xR;
        } else if(Math.abs(moveVelocityXY[0]) >= VELOCITY_THRESHOLD){ //松手后模拟惯性滑动一段距离，数值有负有正
            needTransition.value = true;
            transXY[0] = getNumberBetween(transXY[0] + moveVelocityXY[0] * INERTIA_STEP, limitArea.value.xR, limitArea.value.xL);
        }
        
        if(transXY[1] > limitArea.value.yT){//松手后顶部自动回位
            needTransition.value = true;
            transXY[1] = limitArea.value.yT;
        } else if(transXY[1] < limitArea.value.yB){//松手后顶部自定回位
            needTransition.value = true;
            transXY[1] = limitArea.value.yB;
        } else if(Math.abs(moveVelocityXY[1]) >= VELOCITY_THRESHOLD){//松手后模拟惯性滑动一段距离，数值有负有正
            needTransition.value = true;
            transXY[1] = getNumberBetween(transXY[1] + moveVelocityXY[1] * INERTIA_STEP, limitArea.value.yB, limitArea.value.yT);
        }
        
        cursorType.value = (imageScale.value > 1 ? "grab" : "pointer");
    }
</script>

<style>
    .gti-img-box{
        user-select: none;
    }
</style>