<template>
    <div v-if="shareInfos && shareInfos.id===shareID" class="hi-cwh">
        <div class="msd-userinfo-box" :class="{'hidden': isHideText}">
            <img class="msd-user-avatar" :src="publicAssets.iconDefaultUserAvatar" />
            <div class="mg-l-rem5 fx-g1">
                <span class="dp-bk fw-b" title="分享这张照片的用户的名称">{{shareInfos.authorNickname}}</span>
                <span class="dp-bk fs-rem6 tc-33" title="分享这张照片的时间和地点">{{shareInfos.createTime}}&nbsp;•&nbsp;拍摄于{{shareInfos.locationAddress}}附近</span>
            </div>
        </div>
        <swiper-container
            :slides-per-view="1"
            :auto-height="false"
            :watch-overflow="false"
            @swiperslidechange="onSlideChange"
            @click="toggleHideText"
            effect="slide"
            style="height:100%">
            <swiper-slide v-for="item in shareInfos.pictureList" :key="item.id" class="fx-vm">
                <gesture-image :alt="item.description" :src="item.path" />
            </swiper-slide>
        </swiper-container>
        <div class="msd-bottom-box fx-c fx-je" :class="{'hidden': isHideText}">
            <span class="dp-bk">{{shareInfos.pictureList[picIndex].description || shareInfos.title}}</span>
        </div>
    </div>
</template>

<script setup name="IndexMap3DShareDetails">
    import { ref } from "vue";
    import { useRoute } from "vue-router";
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import gestureImage from "@/components/gestureImage.vue";
    
    //swiper开发文档：https://www.swiper.com.cn/api/index.html
    
    const $route = useRoute();
    const shareInfos = myStorage.onceObject("user_sharepic_infos");
    const shareID = (+$route.query.sid || 0);
    const picIndex = ref(0);
    const isHideText = ref(false);
    
    function onSlideChange(evt){
        picIndex.value = evt.target.swiper.realIndex;
    }
    function toggleHideText(){
        isHideText.value = !isHideText.value;
    }
</script>

<style scoped="scoped">
    .msd-userinfo-box{
        display: flex;
        flex-direction: row;
        position: fixed;
        padding: 0.5rem;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9;
        background-image: linear-gradient(0deg,rgba(255,255,255,0),rgba(255,255,255,0.7));
        transform: translateY(0%);
        transition: transform 300ms;
    }
    .msd-userinfo-box.hidden{
        transform: translateY(-100%);
    }
    
    .msd-user-avatar{
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        border: 0.1rem solid #fff;
    }
    .msd-bottom-box{
        position: fixed;
        padding: 0.5rem;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        min-height: 5rem;
        background-image: linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.7));
        transform: translateY(0%);
        transition: transform 300ms;
    }
    .msd-bottom-box.hidden{
        transform: translateY(100%);
    }
</style>