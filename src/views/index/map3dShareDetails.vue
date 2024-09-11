<template>
    <div class="page-limit-width">
        <template v-if="shareInfos && shareInfos.id">
            <div class="fixed-limit-width msd-userinfo-box" :class="{'hidden': isHideText}" @click="gotoUserPage">
                <img class="msd-user-avatar" :src="shareInfos.authorAvatarUrl || publicAssets.iconDefaultUserAvatar" />
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
                @swiperdoubletap="onSwiperDblclick"
                @click="toggleHideText"
                effect="slide"
                class="content-cage"
                style="padding:0;overflow:hidden">
                <swiper-slide v-for="item in shareInfos.pictureList" :key="item.id" class="fx-vm">
                    <!-- 2024年7月19日。swiper自带缩放功能，体验不佳，弃用 <div class="swiper-zoom-container">
                        <img :alt="item.description" :src="item.picPath" class="wi-f" />
                    </div> -->
                    <gesture-image :alt="item.description" :src="item.picPath" />
                </swiper-slide>
            </swiper-container>
            <div @click="toggleHideText" class="fixed-limit-width msd-bottom-box fx-c fx-je" :class="{'hidden': isHideText}">
                <span class="dp-bk">{{shareInfos.title}}</span>
            </div>
            <map3d-canal-thumbnail ref="mctBox" :pic-lng="shareInfos.longitude" :pic-lat="shareInfos.latitude" />
        </template>
        <template v-else-if="isLoading">
            <div class="content-cage fx-vm">
                <img :src="publicAssets.imageLoadingGif" alt="正在加载" class="dp-ib wh-3rem" />
            </div>
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
    import { ref, reactive, getCurrentInstance, onActivated } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import { useStore } from "vuex";
    import { needDebounce } from "@/utils/cocohelper.js";
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import gestureImage from "@/components/gestureImage.vue";
    import map3dCanalThumbnail from "@/components/map3dCanalThumbnail.vue";
    import ajaxRequest from "@/request/index.js";
    
    //swiper开发文档：https://www.swiper.com.cn/api/index.html
    //swiper属性大全：https://swiperjs.com/swiper-api

    const $instance = getCurrentInstance();
    const $route = useRoute();
    const $router = useRouter();
    const $store = useStore();
    const shareInfos = reactive({});
    const isLoading = ref(true);
    const picIndex = ref(0);
    const isHideText = ref(false);
    const nonRVs = { //非响应式变量（non Responsive Variables）
        hasDblClicked: false, //是否双击过了
    };
    
    function onSlideChange(evt){
        picIndex.value = evt.target.swiper.realIndex;
    }
    function onSwiperDblclick(evt){
        nonRVs.hasDblClicked = true;
    }
    function toggleHideText(){
        if($instance.refs.mctBox.checkZoomIn()){
            $instance.refs.mctBox.disabledZoomIn();
            nonRVs.hasDblClicked = false;
        } else {
            needDebounce(() => {
                if(!nonRVs.hasDblClicked){ //处理双击时触发连个点击事件的问题
                    isHideText.value = !isHideText.value;
                    $instance.refs.mctBox.toggleSideHidden();
                }
                nonRVs.hasDblClicked = false;
            }, 300);
        }
    }
    function goBackToHomePage(){
        $router.replace("/");
    }
    function gotoUserPage(){
        //if original page is from user center
        if($route.query.ogpg === "USER_CENTER"){
            $router.back();
        } else {
            $router.push("/user?uid=" + encodeURIComponent(shareInfos.authorNickname));
        }
    }
    
    onActivated(() => {
        const sid = (+$route.query.sid || 0); //share id
        const dat = myStorage.onceObject("user_sharepic_infos_" + sid);
        
        if(dat){
            Object.assign(shareInfos, dat);
            if($store.getters.currentReadPostIds.indexOf(sid) < 0){
                //更新帖子查看次数
                ajaxRequest("updatePostViewCount", { postId: sid }).then(() => {
                    $store.dispatch("addReadPostId", sid)
                });
            }
            isLoading.value = false;
        } else {//如果本地没有缓存数据，就到服务器加载！
            ajaxRequest("getPostById", { postId: sid }, true).then(res => {
                Object.assign(shareInfos, res);
                myStorage.onceObject("user_sharepic_infos_" + sid, res);
                isLoading.value = false;
            }).catch(() => {
                isLoading.value = false;
            });
        }
    });
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