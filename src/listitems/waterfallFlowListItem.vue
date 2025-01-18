<template>
    <li v-if="props.itemInfo" class="wfli-container" @click="onItemTap">
        <img :src="props.itemInfo.pictureList[0].thumbnailPath" class="wfli-thumbnail" onerror="onImageLoadingError()" />
        <p v-if="props.itemInfo.title.length > MAX_TEXT_LENGTH" class="wfli-title">{{props.itemInfo.title.substr(0, MAX_TEXT_LENGTH)}}…</p>
        <p v-else class="wfli-title">{{props.itemInfo.title}}</p>
        <div class="pd-lr-rem25 pd-b-rem5 tc-99 fs-rem6 fx-hc">
            <img :src="props.itemInfo.authorAvatarUrl" alt="作者头像" class="wh-1rem br-h" />
            <span class="fx-g1">&nbsp;{{props.itemInfo.authorNickname}}</span>
            <span>&nbsp;{{props.itemInfo.createTime?.substr(0, 10)}}</span>
        </div>
        <img v-if="props.itemInfo.isVideo" :src="publicAssets.iconPlayCircle" class="wfli-is-video" alt="视频内容" />
    </li>
    <li v-else class="wfli-container fx-c" data-desc="骨架屏">
        <div class="skeleton-loading-ani skeleton-loading-image fx-g1"></div>
        <div class="wfli-title">
            <p class="skeleton-loading-text wi-f"></p>
            <p class="skeleton-loading-text wi-col-8 va-m"></p>
        </div>
        <div class="pd-lr-rem25 pd-b-rem5 fs-rem6 fx-r">
            <span class="skeleton-loading-avatar br-h"></span>
            <span class="skeleton-loading-text mg-l-rem25 wi-col-3"></span>
            <span class="fx-g1 hi-1rem"></span>
            <span class="skeleton-loading-text wi-col-4"></span>
        </div>
    </li>
</template>

<script setup name="WaterfallFlowListItem">
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
    const emits = defineEmits(["itemtap"]);
    
    const MAX_TEXT_LENGTH = 50; //显示的最大文本长度
    
    function onItemTap(){
        emits("itemtap", props.itemIndex);
    }
</script>

<style>
    .wfli-container{
        position: absolute;
        z-index: 1;
        cursor: pointer;
        overflow: hidden;
        background-color: #fff;
        border-radius: 0.25rem;
    }
    .wfli-container:active{
        opacity: 0.6;
    }
    .wfli-thumbnail{
        display: block;
        width: 100%;
        max-height: 50vh;
        background-color: #f0f0f0;
        object-fit: cover;
    }
    .wfli-title{
        padding: 0.5rem 0.25rem;
        font-size: 0.7rem;
        font-weight: 500;
    }
    .wfli-is-video{
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        z-index: 1;
        width: 1.5rem;
        height: 1.5rem;
    }
</style>