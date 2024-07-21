<template>
    <div class="page-limit-width">
        <template v-if="shareInfos && shareInfos.id===shareID">
            <div class="fixed-limit-width msd-userinfo-box" :class="{'hidden': isHideText}">
                <img class="msd-user-avatar" :src="publicAssets.iconDefaultUserAvatar" />
                <div class="mg-l-rem25 fx-g1">
                    <span class="dp-bk fw-b" title="分享这张照片的用户的名称">{{shareInfos.authorNickname}}</span>
                    <span class="dp-bk fs-rem6 tc-33" title="分享这张照片的时间和地点">{{shareInfos.createTime}}&nbsp;•&nbsp;拍摄于{{shareInfos.locationAddress}}附近</span>
                </div>
            </div>
            <swiper-container
                :slides-per-view="1"
                :auto-height="false"
                :watch-overflow="false"
                :mousewheel="true"
                :touch-start-prevent-default="false"
                :zoom="false"
                :max-ratio="4"
                @swiperslidechange="onSlideChange"
                @click="toggleHideText"
                effect="slide"
                class="content-cage"
                style="padding:0;overflow:hidden">
                <swiper-slide v-for="item in shareInfos.pictureList" :key="item.id" class="fx-vm">
                    <!-- 2024年7月19日。swiper自带缩放功能，体验不佳，弃用 <div class="swiper-zoom-container">
                        <img :alt="item.description" :src="item.path" class="wi-f" />
                    </div> -->
                    <gesture-image :alt="item.description" :src="item.path" />
                </swiper-slide>
            </swiper-container>
            <div class="fixed-limit-width msd-bottom-box fx-c fx-je" :class="{'hidden': isHideText}">
                <span class="dp-bk">{{shareInfos.pictureList[picIndex].description || shareInfos.title}}</span>
            </div>
            <map3d-canal-thumbnail :pic-lng="shareInfos.longitude" :pic-lat="shareInfos.latitude" />
        </template>
        <template v-else >
            <div class="content-cage" style="padding-top:15vh">
                <h4 class="fs-1rem tc-33 ta-c">照片已失效</h4>
                <img :src="publicAssets.imageImgLost" style="display:block;margin:2rem auto;width:10rem;height:auto;" />
                <a class="dp-bk tc-b0 ta-c fw-b" @click="goBackToHomePage">返回主页</a>
            </div>
        </template>
    </div>
</template>

<script setup name="IndexMap3DShareDetails">
    import { ref } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import gestureImage from "@/components/gestureImage.vue";
    import map3dCanalThumbnail from "@/components/map3dCanalThumbnail.vue";
    
    //swiper开发文档：https://www.swiper.com.cn/api/index.html
    //swiper属性大全：https://swiperjs.com/swiper-api
    
    const $route = useRoute();
    const $router = useRouter();
    const shareInfos = myStorage.onceObject("user_sharepic_infos");
    const shareID = (+$route.query.sid || 0);
    const picIndex = ref(0);
    const isHideText = ref(false);
    
    function onSlideChange(evt){
        picIndex.value = evt.target.swiper.realIndex;
    }
    function toggleHideText(){
        //isHideText.value = !isHideText.value;
    }
    function goBackToHomePage(){
        $router.replace("/");
    }
</script>

<style scoped="scoped">
    .msd-userinfo-box{
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.5rem;
        top: 0;
        right: 0;
        background-image: linear-gradient(0deg,rgba(255,255,255,0),rgba(255,255,255,0.7));
        transform: translateY(0%);
        transition: transform 300ms;
        user-select: none;
    }
    .msd-userinfo-box.hidden{
        transform: translateY(-100%);
    }
    
    .msd-user-avatar{
        border-radius: 50%;
        width: 2.5rem;
        height: 2.5rem;
        border: 0.1rem solid #fff;
    }
    .msd-bottom-box{
        padding: 0.5rem;
        bottom: 0;
        right: 0;
        min-height: 5rem;
        background-image: linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.7));
        transform: translateY(0%);
        transition: transform 300ms;
        user-select: none;
    }
    .msd-bottom-box.hidden{
        transform: translateY(100%);
    }
</style>