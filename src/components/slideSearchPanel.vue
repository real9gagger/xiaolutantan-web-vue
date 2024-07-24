<template>
    <div class="ssp-search-panel"
        :style="`height:${panelHeight}vh`"
        @touchstart="onPanelTouchStart"
        @touchmove="onPanelTouchMove"
        @touchend="onPanelTouchEnd"
        @touchcancel="onPanelTouchEnd"
        @transitionend="onPanelTransitionEnd"
        @mousedown="onPanelTouchStart"
        @mousemove="onPanelTouchMove"
        @mouseup="onPanelTouchEnd"
        @mouseleave="onPanelTouchEnd"
        @scroll="console.log"><slot />
        <div v-show="isTouched.ttt" class="ssp-mask-box"></div>
    </div>
</template>

<script setup name="SlideSearchPanel">
    import { ref, defineProps } from "vue";
    
    const props = defineProps({
        minHeight: {
            type: Number,
            default: 40 /*单位：vh*/
        },
        maxHeight: {
            type: Number,
            default: 80 /*单位：vh*/
        },
        scrollerId: { /*滚动的元素的ID*/
            type: String,
            default: ""
        }
    });
    
    const AUTO_SLIDE_THRESHOLD = 40;
    const panelHeight = ref(40);
    const isTouched = ref(false);
    const touchStartXY = [0, 0];
    //非响应式变量（Non responsive variables）
    const nonRVs = { 
        isRunTransition: false
    };
    
    function onPanelTouchStart(evt){
        //还原/重置
        const elem = document.getElementById(props.scrollerId);
        console.log(elem?.scrollTop)
        if(!elem || elem.scrollTop <= 0){//滚动位置为0时才处理
            if(evt.type === "touchstart"){
                touchStartXY[0] = (evt.touches.length === 1 ? evt.touches[0].clientX : -1);
                touchStartXY[1] = (evt.touches.length === 1 ? evt.touches[0].clientY : -1);
            } else {
                touchStartXY[0] = (evt.clientX);
                touchStartXY[1] = (evt.clientY);
            }
            if(elem && panelHeight.value !== props.maxHeight){
                //evt.preventDefault();
                //evt.stopPropagation();
                elem.style.overflow = "hidden";
            } else {
                elem.style.overflow = null;
            }
            isTouched.value = (panelHeight.value !== props.maxHeight);
        } else {
            touchStartXY[0] = -1;
            touchStartXY[1] = -1;
        }
    }
    function onPanelTouchMove(evt){
        if (touchStartXY[0] >= 0 && touchStartXY[1] >= 0 && !nonRVs.isRunTransition) {
            const isTm = (evt.type === "touchmove");
            const cXY = [(isTm ? evt.touches[0].clientX : evt.clientX), (isTm ? evt.touches[0].clientY : evt.clientY)];
            const diffX = (cXY[0] - touchStartXY[0]);
            const diffY = (cXY[1] - touchStartXY[1]);
            if (Math.abs(diffY) > Math.abs(diffX)) {//上下滑动时才处理。【左右滑动不处理】
                if (diffY > AUTO_SLIDE_THRESHOLD) { //向下滑动
                	if (panelHeight.value >= props.maxHeight) {
                		nonRVs.isRunTransition = true;
                		panelHeight.value = props.minHeight;
                	}
                    touchStartXY[0] = cXY[0];
                    touchStartXY[1] = cXY[1];
                } else if (diffY < -AUTO_SLIDE_THRESHOLD) { //向上滑动
                	if (panelHeight.value <= props.minHeight) {
                		nonRVs.isRunTransition = true;
                		panelHeight.value = props.maxHeight;
                	}
                    touchStartXY[0] = cXY[0];
                    touchStartXY[1] = cXY[1];
                }
            }
        }
    }
    function onPanelTouchEnd(evt){
        //还原/重置
        touchStartXY[0] = -1;
        touchStartXY[1] = -1;
        isTouched.value = false;
    }
    function onPanelTransitionEnd(evt) {
        //动画执行结束
    	nonRVs.isRunTransition = false;
    }
    
</script>

<style>
    .ssp-search-panel{
        display: flex;
        flex-direction: column;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background-color: #fff;
        user-select: none;
        transition: height 300ms;
    }
    .ssp-mask-box{
        position: fixed;
        inset: 0 0 0 0;
        z-index: 8888;
        cursor: grab;
        background-color: rgba(0,0,0,0.4);
    }
</style>