<template>
    <li v-if="props.itemInfo" class="pd-rem5 bd-b-f0 tp-f0 cs-p" @click="onItemTap">
        <div class="fx-r">
            <p class="upli-thumbnail">
                <img :src="props.itemInfo.pictureList[0].thumbnailPath" class="hi-f" onerror="onImageLoadingError()" />
                <span v-if="props.itemInfo.pictureList.length > 1" class="upli-pic-count">+{{props.itemInfo.pictureList.length - 1}}</span>
                <img v-if="props.itemInfo.isVideo" :src="publicAssets.iconPlayVideo" alt="视频内容" class="ps-a po-tl-0 wh-f" />
                <span v-if="props.itemInfo.isVideo" class="upli-pic-count">{{getFriendlyDuration(props.itemInfo.pictureList[0].duration)}}</span>
            </p>
            <p class="fx-g1 ps-r pd-l-rem5 fx-c">
                <span class="of-lc1 fw-b">{{props.itemInfo.title}}</span>
                <span class="of-lc1 fs-rem6 tc-99 pd-tb-rem25">{{props.itemInfo.locationAddress}}</span>
                <span class="dp-bk fs-rem6 tc-99 fx-g1">{{props.itemInfo.authorNickname}}&ensp;{{props.itemInfo.createTime}}</span>
            </p>
        </div>
    </li>
    <li v-else class="pd-rem5 bd-b-f0 fx-r" data-desc="骨架屏">
        <div class="upli-thumbnail skeleton-loading-image skeleton-loading-ani"></div>
        <div class="fx-g1 pd-l-rem5">
            <p class="skeleton-loading-text wi-f skeleton-loading-ani"></p>
            <p class="fs-rem6"><span class="skeleton-loading-text wi-col-8"></span></p>
            <p class="fs-rem6"><span class="skeleton-loading-text wi-col-6"></span></p>
        </div>
    </li>
</template>

<script setup name="UserPostListItem">
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
    const emits = defineEmits(["itemtap"]);
    
    function onItemTap(){
        emits("itemtap", props.itemIndex);
    }
</script>

<style>
    .upli-thumbnail{
        width: 4.2rem;
        height: 4.2rem;
        border-radius: 0.3rem;
        overflow: hidden;
        background-color: #eee;
        text-align: center;
        position: relative;
    }
    .upli-pic-count{
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
</style>