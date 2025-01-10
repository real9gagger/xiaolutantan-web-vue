<template>
    <section class="fixed-limit-width csb-container"
    :style="constainerStyle"
    @touchstart="onPointerStart"
    @touchmove="onPointerMove"
    @touchend="onPointerEnd"
    @touchcancel="onPointerEnd"
    @mousedown="onPointerStart"
    @mousemove="onPointerMove"
    @mouseup="onPointerEnd"
    @mouseleave="onPointerEnd"
    @transitionend="onTransitionEnd">
        <div class="fx-hc">
            <img :src="props.userAvatar || publicAssets.iconDefaultUserAvatar" data-is-avatar="yes" alt="用户头像" class="csb-user-avatar" />
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
                data-is-close="yes" />
        </div>
        <pre class="ws-w mg-t-1rem lh-1x5" :class="{'csb-show-more': !ratioVal}" data-is-content="yes">{{!ratioVal ? shortContent : props.content}}</pre>
    </section>
</template>

<script setup name="ContentSlideBox">
    import { computed, ref, watch, getCurrentInstance, onMounted, onUnmounted } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const CONTENT_MAX_LENGTH = 40;
    const LIMIT_HEIGHT_PX = Math.round(window.innerHeight * 0.75);
    const DEFAULT_HEIGHT_PX = (9.0 * window.pxOf1rem);
    const CLIP_RECT_HEIGHT = (DEFAULT_HEIGHT_PX - 40); //被裁剪的矩形的高度，需要减去视频控制条高度（像素）
    const ELASTIC_COEFFICIENT = 0.1;//当滑动到顶部时，再继续滑动时的弹性系数
    const VELOCITY_THRESHOLD = 1; //移动时超过这个数据会启动惯性继续移动一段距离
    
    const $instance = getCurrentInstance();
    const containerHeight = ref(DEFAULT_HEIGHT_PX); //容器的最小高度
    const isMovable = ref(false); //是否可滑动
    const isNeedTransition = ref(false); //是否需要过渡效果
    const isHiding = ref(false); //是否隐藏此面板
    const isScrollable = ref(false); //内容是否可以滚动
    const nonRVs = { //非响应式变量（non Responsive Variables）
        startTS: 0, //开始触摸时的时间戳（毫秒）
        startCY: 0, //开始触摸时的Y轴位置（像素）
        moveDis: 0, //累计移动的路程
        moveLY: 0, //上次移动的Y轴的位置
        scrollType: 0x00, //0x00 - 已滚动到顶部，0x11 - 不是滚动顶部或者底部，0x22 - 已滚动到底部
        windowOldHeight: window.innerHeight, //窗体尺寸改变前的高度
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
            default: "子标题"
        },
        content: {
            type: String,
            default: "视频内容"
        },
        isShrink: { //是否缩起来
            type: Boolean,
            default: false
        }
    });
    const emits = defineEmits(["sliding", "hiding", "avatarclick"]);
    
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
        //确保在 0~1 之间。
        return Math.max(0, Math.min(1, ratio));
    });
    const constainerStyle = computed(() => {
        const colorRGB =  Math.round(255 * (1 - ratioVal.value));
        return {
            height: (containerHeight.value + "px"),
            backgroundColor: `rgba(255, 255, 255, ${ratioVal.value})`,
            color: `rgb(${colorRGB}, ${colorRGB}, ${colorRGB})`,
            transform: `translateY(${isHiding.value ? DEFAULT_HEIGHT_PX : 0}px)`,
            userSelect: (isMovable.value ? "none" : "text"),
            clipPath: (!ratioVal.value ? `polygon(0% 0%, 100% 0%, 100% ${CLIP_RECT_HEIGHT}px, 0% ${CLIP_RECT_HEIGHT}px)` : "none"),
            overflow: (isScrollable.value ? "auto" : "hidden"),
            transition: (isNeedTransition.value ? "all 300ms": "none")
        };
    });
    
    function onShowMoreContent(){
        if(containerHeight.value !== LIMIT_HEIGHT_PX){
            const oldVal = containerHeight.value;
            
            containerHeight.value = LIMIT_HEIGHT_PX;
            isNeedTransition.value = true;
            isHiding.value = false;
            
            emits("sliding", {
                delta: (oldVal - containerHeight.value),
                offset: DEFAULT_HEIGHT_PX,
                transitionable: true
            });
        }
        
        //等动画执行完再判断
        needDebounce(() => (isScrollable.value = ($instance.proxy.$el.scrollHeight > $instance.proxy.$el.clientHeight)), 320);
    }
    
    function onCloseMoreContent(){
        if(containerHeight.value !== DEFAULT_HEIGHT_PX){
            const oldVal = containerHeight.value;
            
            containerHeight.value = DEFAULT_HEIGHT_PX;
            isNeedTransition.value = true;
            isHiding.value = false;
            
            emits("sliding", {
                delta: (oldVal - containerHeight.value),
                offset: 0,
                transitionable: true
            });
        }
        isScrollable.value = false;
    }
    
    function onHideMoreContent(){
        isHiding.value = !isHiding.value;
        isNeedTransition.value = true;
        emits("hiding", isHiding.value);
    }
    
    function onPointerStart(evt){
        //console.log("移动开始…", evt);
        const elem = $instance.proxy.$el;
        nonRVs.scrollType = (elem.scrollTop <= 0 ? 0x00 : (Math.ceil(elem.clientHeight + elem.scrollTop) < elem.scrollHeight ? 0x11 : 0x22));
        if(nonRVs.scrollType !== 0x11){//滚动到顶部或者底部时才触发
            if(evt.type === "touchstart"){//单个手指触控时才有效
                if(evt.touches.length === 1){
                    nonRVs.startCY = evt.touches[0].clientY;
                } else {
                    return;
                }
            } else {//鼠标左键按下时才有效
                if(evt.button === 0){
                    nonRVs.startCY = evt.clientY;
                } else {
                    return;
                }
            }
            
            isMovable.value = true;
            isNeedTransition.value = false;
            nonRVs.moveDis = 0;
            nonRVs.moveLY = nonRVs.startCY;
            nonRVs.startTS = evt.timeStamp;
        }
    }
    
    function onPointerMove(evt){
        //console.log("正在移动…", evt);
        if(isMovable.value){
            const ctY = (evt.type === "touchmove" ? evt.touches[0].clientY : evt.clientY);
            const movementY = (ctY - nonRVs.moveLY);
            const oldVal = containerHeight.value;
            const newVal = (oldVal - movementY);
            
            //如果内容处于可滚动状态并且是向上滑动时，则不处理移动事件
            if(isScrollable.value){
                switch(nonRVs.scrollType){
                    case 0x11: return; //不是滚动到顶部或者底部时，则不处理事件
                    case 0x22: //滑动到底部时，想继续滚动内容，但是没有更多内容了，则震动提示，否则不处理事件
                        if(movementY < 0){
                            navigator.vibrate(10);
                        }
                    return;
                    default: //滑动到顶部时，想滚动内容，则不处理事件
                        if(movementY < 0 && ratioVal.value===1){
                            return;
                        }
                    break;
                }
            }
            
            if(newVal <= DEFAULT_HEIGHT_PX || newVal >= LIMIT_HEIGHT_PX){
                containerHeight.value -= (ELASTIC_COEFFICIENT * movementY);
                navigator.vibrate(10);
            } else {
                containerHeight.value = newVal;
            }
            
            nonRVs.moveDis += Math.abs(movementY);
            nonRVs.moveLY = ctY;
            
            emits("sliding", {
                delta: (oldVal - containerHeight.value),
                offset: Math.round(DEFAULT_HEIGHT_PX * ratioVal.value),
                transitionable: false
            });
        }
    }
    
    function onPointerEnd(evt){
        //console.log("移动结束…", evt);
        //判断是不是点击事件
        if(nonRVs.moveDis <= 10){//小于一个临界值则判断为点击事件
            if(evt.target.hasAttribute("data-is-content")){//点击内容才触发
                onShowMoreContent();
            } else if(evt.target.hasAttribute("data-is-avatar")){//点击了头像
                emits("avatarclick", true);
            } else if(evt.target.hasAttribute("data-is-close")){//点击了关闭
                onCloseMoreContent();
            }
        }
        
        if(isMovable.value){
            isMovable.value = false;
            //判断惯性滑动：计算速度
            const velocity = (evt.timeStamp > nonRVs.startTS ? (nonRVs.moveLY - nonRVs.startCY) / (evt.timeStamp - nonRVs.startTS) : 0);
            if(velocity > VELOCITY_THRESHOLD){//向下滑动
                onCloseMoreContent();
            } else if(velocity < -VELOCITY_THRESHOLD){//向上滑动
                onShowMoreContent();
            } else {
                if(ratioVal.value >= 0.5){
                    onShowMoreContent();
                } else {
                    onCloseMoreContent();
                }
            }
            nonRVs.startTS = 0;
            nonRVs.startCY = 0;
            nonRVs.moveDis = 0;
            nonRVs.moveLY = 0;
            
            evt.preventDefault();
            evt.stopPropagation();
        }
    }
    
    function onTransitionEnd(){
        isNeedTransition.value = false;
    }
    
    function checkWhetherHide(){
        //检查是否隐藏
        return isHiding.value;
    }
    
    function onWindowResized(evt){
        emits("sliding", {
            delta: (window.innerHeight - nonRVs.windowOldHeight),
            offset: Math.round(DEFAULT_HEIGHT_PX * ratioVal.value),
            transitionable: false
        });
        nonRVs.windowOldHeight = window.innerHeight;
    }
    
    watch(() => props.isShrink, function(){
        if(ratioVal.value){
            onCloseMoreContent();
        } else {
            onHideMoreContent(); //彻底隐藏内容！
        }
    });
    
    onMounted(() => {
        window.addEventListener("resize", onWindowResized);
    });
    
    onUnmounted(() => {
        window.removeEventListener("resize", onWindowResized);
    });
    
    defineExpose({
        checkWhetherHide
    });
</script>

<style>
    .csb-container{
        bottom: 0;
        padding: 1rem 0.7rem 2.0rem 0.7rem;
        border-radius: 1rem 1rem 0 0;
    }
    .csb-user-avatar{
        border-radius: 50%;
        width: 2.5rem;
        height: 2.5rem;
    }
    .csb-show-more::after{
        content: " 更多";
        color: var(--main-color);
        cursor: pointer;
    }
</style>