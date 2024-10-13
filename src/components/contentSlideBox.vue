<template>
    <section class="fixed-limit-width csb-container" 
    :style="constainerStyle"
    @pointerdown="onPointerStart"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @pointercancel="onPointerEnd"
    @pointerleave="onPointerEnd"
    @transitionend="onTransitionEnd">
        <div class="fx-hc">
            <img :src="props.userAvatar || publicAssets.iconDefaultUserAvatar" alt="用户头像" class="csb-user-avatar" />
            <p class="mg-l-rem5 fx-g1">
                <span class="dp-bk fw-b">{{props.userNickname}}</span>
                <span class="dp-bk fs-rem6 op-8">{{props.subTitle}}</span>
            </p>
            <img 
                :src="publicAssets.iconCloseXGrey"
                :style="`opacity:${ratioVal}`"
                alt="关闭" 
                class="cs-p fx-st"
                style="width:1.25rem;height:1.25rem"
                @click="onCloseMoreContent" />
        </div>
        <pre class="ws-w mg-t-1rem lh-1x5" :class="{'csb-show-more': !ratioVal}" data-is-content="yes">{{!ratioVal ? shortContent : props.content}}</pre>
    </section>
</template>

<script setup name="ContentSlideBox">
    import { computed, defineProps, defineEmits, ref, watch } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const CONTENT_MAX_LENGTH = 40;
    const LIMIT_HEIGHT_PX = Math.round(window.innerHeight * 0.75);
    const DEFAULT_HEIGHT_PX = (8 * window.pxOf1rem);
    
    const containerHeight = ref(DEFAULT_HEIGHT_PX); //容器的最小高度
    const isMoving = ref(false);
    const isNeedTransition = ref(false);
    const isHiding = ref(false);
    const nonRVs = { //非响应式变量（non Responsive Variables）
        startTS: 0, //开始触摸时的时间戳（毫秒）
        startCY: 0, //开始触摸时的Y轴位置（毫秒）
        moveDis: 0,//累计移动的路程
    };
    
    const props = defineProps({
        userAvatar: {
            type: String,
            default: ""
        },
        userNickname: {
            type: String,
            default: "用户名称"
        },
        subTitle: {
            type: String,
            default: "用户名称"
        },
        content: {
            type: String,
            default: "用户名称"
        },
        isShrink: { //是否缩起来
            type: Boolean,
            default: false
        }
    });
    const emits = defineEmits(["sliding", "hiding"]);
    
    const shortContent = computed(() => {
        if(!props.content){
            return "";
        }
        
        if(props.content.length <= CONTENT_MAX_LENGTH){
            return props.content;
        } else {
            return props.content.substr(0, CONTENT_MAX_LENGTH) + "…";
        }
    });
    const ratioVal = computed(() => {
        const ratio = (containerHeight.value - DEFAULT_HEIGHT_PX) / (LIMIT_HEIGHT_PX - DEFAULT_HEIGHT_PX);
        return Math.max(0, Math.min(1, ratio));
    });
    const constainerStyle = computed(() => {
        const colorRGB =  Math.round(255 * (1 - ratioVal.value));
        return {
            height: (containerHeight.value + "px"),
            backgroundColor: `rgba(255, 255, 255, ${ratioVal.value})`,
            color: `rgb(${colorRGB}, ${colorRGB}, ${colorRGB})`,
            transform: `translateY(${isHiding.value ? DEFAULT_HEIGHT_PX : 0}px)`,
            userSelect: (isMoving.value ? "none" : "text"),
            transition: (isNeedTransition.value ? "all 300ms": "none")
        };
    });
    
    function onShowMoreContent(){
        if(containerHeight.value !== LIMIT_HEIGHT_PX){
            const oldVal = containerHeight.value;
            
            containerHeight.value = LIMIT_HEIGHT_PX;
            isNeedTransition.value = true;
            
            emits("sliding", {
                delta: (oldVal - containerHeight.value),
                offset: DEFAULT_HEIGHT_PX,
                transitionable: true
            });
        }
    }
    
    function onCloseMoreContent(){
        if(containerHeight.value !== DEFAULT_HEIGHT_PX){
            const oldVal = containerHeight.value;
            
            containerHeight.value = DEFAULT_HEIGHT_PX;
            isNeedTransition.value = true;
            emits("sliding", {
                delta: (oldVal - containerHeight.value),
                offset: 0,
                transitionable: true
            });
        }
    }
    
    function onHideMoreContent(){
        isHiding.value = !isHiding.value;
        isNeedTransition.value = true;
        emits("hiding", isHiding.value);
    }
    
    function onPointerStart(evt){
        //console.log("移动开始…", evt);
        isMoving.value = true;
        isNeedTransition.value = false;
        nonRVs.moveDis = 0;
        nonRVs.startTS = evt.timeStamp;
        nonRVs.startCY = evt.clientY;
    }
    
    function onPointerMove(evt){
        //console.log("正在移动…", evt);
        if(isMoving.value){
            const oldVal = containerHeight.value;
            
            containerHeight.value -= evt.movementY;
            
            if(containerHeight.value <= DEFAULT_HEIGHT_PX){
                containerHeight.value = DEFAULT_HEIGHT_PX;
            } else if(containerHeight.value >= LIMIT_HEIGHT_PX){
                containerHeight.value = LIMIT_HEIGHT_PX;
            }
            
            nonRVs.moveDis += Math.abs(evt.movementY);
            
            emits("sliding", {
                delta: (oldVal - containerHeight.value),
                offset: Math.round(DEFAULT_HEIGHT_PX * ratioVal.value),
                transitionable: false
            });
        }
    }
    
    function onPointerEnd(evt){
        //console.log("移动结束…", evt);
        if(isMoving.value){
            isMoving.value = false;
            
            if(ratioVal.value >= 0.5){
                onShowMoreContent();
            } else {
                onCloseMoreContent();
            }
            
            if(nonRVs.moveDis <= 10){//小于一个临界值则判断为点击事件
                if(evt.target.hasAttribute("data-is-content")){//点击内容才触发
                    onShowMoreContent();
                }
            } else {
                //判断惯性滑动：计算速度
                const velocity = (evt.timeStamp > nonRVs.startTS ? (evt.clientY - nonRVs.startCY) / (evt.timeStamp - nonRVs.startTS) : 0);
                const threshold = 1; //移到时超过这个数据会启动惯性继续移到一段距离
                
                if(velocity > threshold){//向下滑动
                    onCloseMoreContent();
                } else if(velocity < -threshold){//向上滑动
                    onShowMoreContent();
                }
            }
            
            nonRVs.startTS = 0;
            nonRVs.startCY = 0;
            nonRVs.moveDis = 0;
        }
    }
    
    function onTransitionEnd(){
        isNeedTransition.value = false;
    }
    
    watch(() => props.isShrink, function(){
        if(ratioVal.value){
            onCloseMoreContent();
        } else {
            onHideMoreContent();
        }
    });
</script>

<style>
    .csb-container{
        bottom: 0;
        padding: 1rem 0.75rem;
        border-radius: 1rem 1rem 0 0;
        overflow: hidden;
        touch-action: pan-x; /* 如果不加这个属性 pointermove 会引起 pointercancel 事件 */
    }
    .csb-user-avatar{
        border-radius: 50%;
        width: 2.5rem;
        height: 2.5rem;
    }
    .csb-show-more::after{
        content: " 更多";
        color: var(--main-color);
    }
</style>