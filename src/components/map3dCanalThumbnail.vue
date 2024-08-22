<template>
    <div v-if="isShowing" class="mct-view-container" 
        :style="divStyle"
        :class="{'grabbing': isGrabbing}"
        @touchstart="onBoxPointerDown"
        @mousedown="onBoxPointerDown"
        @transitionend="onBoxTransitionEnd"
        @click="toggleZoomIn">
        <p class="mct-view-title">拍摄地点</p>
        <a class="mct-view-close" @click="toggleShowing"></a>
        <img ref="imgBox" class="mct-view-pin" draggable="false" :src="publicAssets.iconSharePictureRed" :style="imgStyle" />
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
    
    const southWestLnglat = [108.33817494075683, 21.484622240807173]; //西南角经纬度，GCJ02坐标
    const northEastLnglat = [109.28198237012651, 22.891271741127913]; //东北角经纬度，GCJ02坐标
    const movementXY = [0, 0]; //单指移动时的位置
    const limitXM = [0, 0]; //可滑动的 minX ~ maxX
    const limitYM = [0, 0]; //可滑动的 minY ~ maxY
    
    const BOX_MARGIN_PX = 10; //距离屏幕边缘的像素
    const R_D_RATIO = (Math.PI / 180); //弧度（R）除以角度（D）
    
    const isShowing = ref(true);
    const isGrabbing = ref(false);
    const needTransition = ref(false); //是否需要动画支持
    const isZoomIn = ref(false); //缩略图是否放大显示
    const boxRect = reactive({
        boxWidth: 0,
        boxHeight: 0,
        imgWidth: 0,
        imgHeight: 0,
        mercatorNE: 0,
        pxPerLnglatX: 0,
        pxPerLnglatY: 0,
    });
    const posXY = reactive([0, 0, 100, 0]); //第一、二元素指定当前位置，第三、四个元素指定变换原点。
    const divStyle = computed(() => ({
        transition: (needTransition.value ? "transform 200ms cubic-bezier(0, 0, 0, 0.8) 0s" : "none"),
        transform: `translate(${posXY[0]}px, ${posXY[1]}px) scale(${isZoomIn.value ? 4 : 1})`,
        transformOrigin: `${posXY[2]}% ${posXY[3]}%`
    }));
    const imgStyle = computed(() => {
        return {
            left: Math.round((props.picLng - southWestLnglat[0]) * boxRect.pxPerLnglatX - boxRect.imgWidth / 2) + "px",
            top: Math.round((getMercatorY(props.picLat) - boxRect.mercatorNE) * boxRect.pxPerLnglatY - boxRect.imgHeight) + "px",
        }
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
    function toggleShowing(evt){
        evt.preventDefault();
        evt.stopPropagation();
        isShowing.value = !isShowing.value;
    }
    function toggleZoomIn(){
        if(!needTransition.value){
            needTransition.value = true;
            isZoomIn.value = !isZoomIn.value;
        }
    }
    function onBoxPointerDown(evt){
        //console.log("指针按下…", evt);
        if(evt.type === "touchstart"){
            const canMove = (evt.touches.length === 1); //单个手指触控时才有效
            movementXY[0] = (canMove ? evt.touches[0].clientX : 0);
            movementXY[1] = (canMove ? evt.touches[0].clientY : 0);
            if(canMove){
                document.ontouchmove = onBoxPointerMove;
                document.ontouchend = onBoxPointerUp;
                document.ontouchcancel = onBoxPointerUp;
            }
        } else {
            const canMove = (evt.button === 0); //鼠标左键按下时才有效
            movementXY[0] = (canMove ? 0x168 : 0); //随便一个大于0的数即可
            movementXY[1] = (canMove ? 0x168 : 0);
            if(canMove){
                document.onmousemove = onBoxPointerMove;
                document.onmouseup = onBoxPointerUp;
                document.onmouseleave = onBoxPointerUp;
            }
        }
        isGrabbing.value = true;
    }
    function onBoxPointerMove(evt){
        //console.log("指针移到…", evt);
        if(movementXY[0] || movementXY[1]){
            if(evt.type === "touchmove"){
                const cXY = [evt.touches[0].clientX, evt.touches[0].clientY];
                posXY[0] = getNumberBetween(posXY[0] + cXY[0] - movementXY[0], limitXM[0], limitXM[1]);
                posXY[1] = getNumberBetween(posXY[1] + cXY[1] - movementXY[1], limitYM[0], limitYM[1]);
                movementXY[0] = cXY[0];
                movementXY[1] = cXY[1];
            } else {
                posXY[0] = getNumberBetween(posXY[0] + evt.movementX, limitXM[0], limitXM[1]);
                posXY[1] = getNumberBetween(posXY[1] + evt.movementY, limitYM[0], limitYM[1]);
            }
        }
    }
    function onBoxPointerUp(evt){
        //console.log("指针松开…", evt);
        if(movementXY[0] || movementXY[1]){
            document.onmousemove = null;
            document.onmouseup = null;
            document.onmouseleave = null;
            document.ontouchmove = null;
            document.ontouchend = null;
            document.ontouchcancel = null;
            
            const wiw = window.innerWidth;
            const wih = window.innerHeight;
            const olds = [...posXY];
            const temp1 = (wiw - boxRect.boxWidth - BOX_MARGIN_PX);
            const temp2 = (wih - boxRect.boxHeight - BOX_MARGIN_PX);
            
            posXY[0] = (posXY[0] > (wiw / 2) ? temp1 : BOX_MARGIN_PX);
            posXY[1] = getNumberBetween(posXY[1], BOX_MARGIN_PX, temp2);
            posXY[2] = (posXY[0] === BOX_MARGIN_PX ? 0 : 100);
            posXY[3] = (posXY[1] === BOX_MARGIN_PX ? 0 : (posXY[1] / temp2 * 100));
            
            needTransition.value = (olds[0] !== posXY[0] || olds[1] !== posXY[1]);

            movementXY[0] = movementXY[1] = 0;
            isGrabbing.value = false;
        }
    }
    function onBoxTransitionEnd(evt){
        //console.log("过渡结束…", evt);
        needTransition.value = false;
    }
    function getMercatorY(lat){
        //参见：https://stackoverflow.com/questions/14329691/convert-latitude-longitude-point-to-a-pixels-x-y-on-mercator-projection
        const latRad = lat * R_D_RATIO; //转成弧度！
        const mercatorNorth = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
        const tempR = 6400; //地球半径（模拟值）
        return (tempR / 2) - (tempR * mercatorNorth / (2 * Math.PI));
    }
    
    nextTick(() => {
        boxRect.boxWidth = $instance.proxy.$el.clientWidth;
        boxRect.boxHeight = $instance.proxy.$el.clientHeight;
        boxRect.imgWidth = $instance.refs.imgBox.clientWidth;
        boxRect.imgHeight = $instance.refs.imgBox.clientHeight;
        boxRect.mercatorNE = getMercatorY(northEastLnglat[1]);
        boxRect.pxPerLnglatX = boxRect.boxWidth / (northEastLnglat[0] - southWestLnglat[0]);
        boxRect.pxPerLnglatY = boxRect.boxHeight / (getMercatorY(southWestLnglat[1]) - boxRect.mercatorNE);

        limitXM[1] = (window.innerWidth - boxRect.boxWidth);
        limitYM[1] = (window.innerHeight - boxRect.boxHeight);
        posXY[0] = limitXM[1] - BOX_MARGIN_PX;
        posXY[1] = BOX_MARGIN_PX;

        //只有在可视范围内才显示地图缩略图
        isShowing.value = !!(
            props.picLng >= southWestLnglat[0] && 
            props.picLng <= northEastLnglat[0] &&
            props.picLat >= southWestLnglat[1] &&
            props.picLat <= northEastLnglat[1]
        );
    });
</script>

<style>
    .mct-view-container{
        position: fixed;
        left: 0;
        top: 0;
        z-index: 8888;
        width: 4rem;
        height: 6.4rem;
        background-position: 0% 0%;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-image: var(--bg-map-canal-thumbnail);
        box-shadow: 0 0 0.3rem 0 #aaa;
        border-radius: 0.3rem;
        cursor: grab;
        overflow: hidden;
    }
    .mct-view-container.grabbing{
        box-shadow: 0 0 0.5rem 0 #aaa;
    }
    .mct-view-title{
        font-size: 0.5rem;
        color: #ccc;
        padding: 0 0.25rem;
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
        inset: 0.1rem 0.1rem auto auto;
        width: 0.6rem;
        height: 0.6rem;
        z-index: 8;
        background-position: 0% 0%;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-image: var(--bg-close-x-grey);
        opacity: 0.5;
    }
</style>