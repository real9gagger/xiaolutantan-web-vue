<template>
    <li v-if="props.itemInfo" class="pd-rem5 ps-r bd-b-f0 cs-p"
    @pointerdown="onItemPointerDown"
    @pointerup="onItemPointerUp" 
    @pointercancel="onItemPointerLeave" 
    @pointerleave="onItemPointerLeave">
        <div class="fx-r ps-r zi-1">
            <p class="mpli-thumbnail">
                <img :src="props.itemInfo.pictureList[0].thumbnailPath" class="hi-f" onerror="onImageLoadingError()" />
                <span v-if="props.itemInfo.pictureList.length > 1" class="mpli-pic-count">+{{props.itemInfo.pictureList.length - 1}}</span>
                <img v-if="props.itemInfo.isVideo" :src="publicAssets.iconPlayVideo" alt="视频内容" class="ps-a po-tl-0 wh-f" />
                <span v-if="props.itemInfo.isVideo" class="mpli-pic-count">{{getFriendlyDuration(props.itemInfo.pictureList[0].duration)}}</span>
            </p>
            <p class="fx-g1 ps-r pd-l-rem5 fx-c">
                <span class="of-lc1 fw-b">{{props.itemInfo.title}}</span>
                <span class="of-lc1 fs-rem6 tc-99 mg-t-rem25">{{props.itemInfo.locationAddress}}</span>
                <span class="dp-bk fs-rem6 tc-99 fx-g1">{{props.itemInfo.authorNickname}}&ensp;{{props.itemInfo.createTime}}</span>
                <span class="dp-bk fs-rem6 tc-99 ta-r lh-1x">浏览 {{props.itemInfo.viewCount}}&emsp;点赞 {{props.itemInfo.likesCount}}&emsp;评论 {{props.itemInfo.commentCount}}&emsp;收藏 {{props.itemInfo.collectCount}}<!-- &emsp;分享 {{props.itemInfo.shareCount}} --></span>
                <span class="dp-bk fs-rem6 tc-o0 lh-1x ps-a po-bl-0 pd-l-rem5" v-if="props.itemInfo.status !== 1">仅自己可见</span>
            </p>
        </div>
        <div v-show="isActived" class="mpli-item-bg"><!-- 背景 --></div>
    </li>
    <li v-else class="pd-rem5 bd-b-f0 fx-r" data-desc="骨架屏">
        <div class="mpli-thumbnail skeleton-loading-image skeleton-loading-ani"></div>
        <div class="fx-g1 pd-l-rem5">
            <p class="skeleton-loading-text wi-f skeleton-loading-ani"></p>
            <p class="fs-rem6"><span class="skeleton-loading-text wi-col-8"></span></p>
            <p class="fs-rem6"><span class="skeleton-loading-text wi-col-6"></span></p>
            <p class="fs-rem6"><span class="skeleton-loading-text wi-col-4"></span></p>
        </div>
    </li>
</template>

<script setup name="MyPostListItem">
    import { ref } from "vue";
    import { needDebounce, clearTimer } from "@/utils/cocohelper.js";
    import { getFriendlyDuration } from "@/utils/pagehelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const props = defineProps({
        itemInfo: {
            type: Object,
            default: null
        },
        itemIndex: {
            type: Number,
            default: -1
        }
    });
    const emits = defineEmits(["itemtap", "longtap", "endtap"]);
    const isActived = ref(false);
    const nonRVs = { //非响应式变量（non Responsive Variables）
        pointerDownTS: 0,
        timerID: 0
    };
    
    function onLongTap(){
        navigator.vibrate(30);
        emits("longtap", props.itemIndex);
    }
    function onItemTap(){
        emits("itemtap", props.itemIndex);
    }
    function onEndTap(){
        emits("endtap", props.itemIndex);
    }
    function setIsActived(){
        isActived.value = true;
    }
    
    function onItemPointerDown(evt){
        if(evt.button === 0){//点击事件。鼠标左键按下时才有效
            evt.preventDefault();
            nonRVs.pointerDownTS = evt.timeStamp;
            clearTimeout(nonRVs.timerID);
            nonRVs.timerID = setTimeout(setIsActived, 50);
            needDebounce(onLongTap, 550);
        }
    }
    function onItemPointerUp(evt){
        clearTimeout(nonRVs.timerID);
        clearTimer(true);
        
        if(evt.button === 0){
            evt.preventDefault();
            const delta = (evt.timeStamp - nonRVs.pointerDownTS);
            if(delta < 300){ //点击事件。鼠标左键按下时才有效
                onItemTap();
            } else { //结束按下事件
                onEndTap();
            }
        }
        
        isActived.value = false;
        nonRVs.timerID = 0;
    }
    function onItemPointerLeave(evt){
        if(nonRVs.timerID){
            clearTimeout(nonRVs.timerID);
            clearTimer(true);
            isActived.value = false;
            nonRVs.timerID = 0;
            onEndTap();
        }
    }
</script>

<style>
    .mpli-thumbnail{
        width: 4.2rem;
        height: 4.2rem;
        border-radius: 0.3rem;
        overflow: hidden;
        background-color: #eee;
        text-align: center;
        position: relative;
    }
    .mpli-pic-count{
        display: block;
        position: absolute;
        right: 0.3rem;
        bottom: 0.2rem;
        z-index: 9;
        font-size: 0.6rem;
        color: #fff;
        font-weight: 500;
        line-height: 1;
    }
    .mpli-item-bg{
        position: absolute;
        inset: 0;
        z-index: 0;
        background-color: rgba(240, 240, 240, 1);
    }
</style>