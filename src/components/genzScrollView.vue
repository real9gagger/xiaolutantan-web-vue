<template>
    <div @scroll="onContainerScroll"><slot></slot></div>
</template>

<script setup name="GenzScrollView">
    import { onMounted, getCurrentInstance, onActivated, nextTick } from "vue";

    /**
     * Z世代风格的滚动视图
     * 支持上拉加载和下拉刷新
    */
   
    const props = defineProps({
        lowerDisabled: {//是否禁用上拉加载事件
            type: Boolean,
            default: false
        },
        lowerDistance: { //距离底部还有多远，触发上拉加载事件
            type: Number,
            default: 20
        },
        lowerImmediately: { //页面首次加载时是否立即触发滚动到底部事件
            type: Boolean,
            default: true
        },
        autoRestoreScrollTop: {//页面返回时是否自动恢复滚动高度
            type: Boolean,
            default: true
        }
    });
    const emits = defineEmits(["scrolltolower"]);
    
    const $instance = getCurrentInstance();
    const nonRVs = {//非响应式变量（non Responsive Variables）
        oldScrollTop: 0,
        toLowerTimes: 0, //在滚动底部滚动的次数
    };
   
    function onContainerScroll(evt){
        const sTop = evt.currentTarget.scrollTop;
        
        if(!props.lowerDisabled && (evt.currentTarget.clientHeight + sTop + props.lowerDistance) >= evt.currentTarget.scrollHeight){
            if(nonRVs.toLowerTimes <= 0){
                emits("scrolltolower", null);
            }
            nonRVs.toLowerTimes++;
        } else {
            nonRVs.toLowerTimes = 0;
        }
        
        nonRVs.oldScrollTop = sTop;
    }
    
    function setScrollTop(top){
        if(top >= 0){
            $instance.proxy.$el.scrollTo(0, top);
        }
    }
    
    function restoreScrollTop(){
        $instance.proxy.$el.scrollTo(0, nonRVs.oldScrollTop);
    }
    
    onActivated(() => {
        if(props.autoRestoreScrollTop && nonRVs.oldScrollTop > 0){
            nextTick(restoreScrollTop);
        }
    });
    
    onMounted(() => {
        if(props.lowerImmediately && !props.lowerDisabled){
            emits("scrolltolower", null);
        }
    });
    
    defineExpose({
        setScrollTop
    });
</script>

<style>
</style>