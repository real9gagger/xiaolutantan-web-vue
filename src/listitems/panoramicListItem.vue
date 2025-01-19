<template>
    <li v-if="props.itemInfo" class="pnli-container" :class="{'actived': props.isActived}" @click.stop="onItemTap">
        <img v-for="pic,nth in props.itemInfo.thumbPaths" 
            :key="nth" 
            :src="pic" 
            :alt="props.itemInfo.title" 
            :class="{'pnli-thumbs': nth > 0}" 
            :style="getThumbStyle(nth)" />
        <span v-if="props.itemInfo.thumbPaths.length > 1" 
            class="pnli-count" 
            :style="getThumbStyle(props.itemInfo.thumbPaths.length)">+{{props.itemInfo.thumbPaths.length - 1}}</span>
        <span class="pnli-title">{{props.itemInfo.title}} • {{props.itemInfo.captureTime}}</span>
    </li>
    <li v-else class="pnli-container" data-desc="骨架屏">
        <div class="skeleton-loading-ani skeleton-loading-image hi-10rem"></div>
    </li>
</template>

<script setup name="PanoramicListItem">
    const props = defineProps({
        itemInfo: {
            type: Object,
            default: null
        },
        itemIndex: {
            type: Number,
            default: -1
        },
        isActived: {
            type: Boolean,
            default: false
        }
    });
    const emits = defineEmits(["itemtap"]);
    
    function onItemTap(){
        emits("itemtap", props.itemIndex);
    }
    function getThumbStyle(nth){
        if(!nth){
            return "width:100%";
        }
        
        const offset = nth * 0.1;
        
        return `transform:translate(-${offset}rem,${offset}rem)`;
    }
</script>

<style>
    .pnli-container{
        position: relative;
        max-height: 10rem;
        overflow: hidden;
        cursor: pointer;
    }
    .pnli-container:active{
        opacity: 0.75;
    }
    .pnli-container.actived::after{
        content: "";
        display: block;
        position: absolute;
        inset: 0;
        z-index: 1;
        border: 0.1rem solid #f56c6c;
    }
    .pnli-thumbs{
        display: block;
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        z-index: 8;
        width: 1.5rem;
        height: 1.5rem;
        border: 0.05rem solid #fff;
    }
    .pnli-count{
        display: block;
        position: absolute;
        top: 1.7rem;
        right: 0.15rem;
        min-width: 1.5rem;
        color: #fff;
        font-size: 0.6rem;
        text-align: center;
        z-index: 8;
        opacity: 0.6;
    }
    .pnli-title{
        display: block;
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 1;
        padding: 0.2rem 0.4rem;
        font-size: 0.6rem;
        color: #fff;
        user-select: none;
    }
</style>