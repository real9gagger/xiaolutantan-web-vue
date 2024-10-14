<template>
    <div class="page-limit-width">
        <template v-if="shareInfos && shareInfos.id">
            <div class="content-cage" style="padding:0;overflow:hidden;background-color:#000">
                <video
                    :src="shareInfos.pictureList[0].picPath"
                    :poster="shareInfos.pictureList[0].thumbnailPath"
                    id="videoBox"
                    class="msv-video-box video-js"
                    style="width:100%;height:100%;">浏览器不支持 HTML5 Video</video>
            </div>
            <content-slide-box
                :user-avatar="shareInfos.authorAvatarUrl"
                :user-nickname="shareInfos.authorNickname"
                :sub-title="shareInfos.createTime + ' • 拍摄于' + shareInfos.locationAddress + '附近'"
                :content="shareInfos.title"
                :is-shrink="isContentShrink"
                @sliding="onContentSliding"
            />
        </template>
        <template v-else-if="isLoading">
            <div class="content-cage fx-vm">
                <img :src="publicAssets.svgLoadingGif" alt="正在加载" class="dp-ib wh-3rem" />
            </div>
        </template>
        <template v-else >
            <data-lost-box class="content-cage" title="视频已失效" />
        </template>
    </div>
</template>

<script setup name="IndexMap3DShareVideo">
    import { ref, reactive, getCurrentInstance, onActivated, onDeactivated, computed, nextTick } from "vue";
    import { useStore } from "vuex";
    import { useRoute, useRouter } from "vue-router";
    import videojs from "video.js";
    import myStorage from "@/utils/mystorage.js";
    import ajaxRequest from "@/request/index.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import dataLostBox from "@/components/dataLostBox.vue";
    import contentSlideBox from "@/components/contentSlideBox.vue";
    import "video.js/dist/video-js.css";
    
    const $route = useRoute();
    const $router = useRouter();
    const $store = useStore();
    const shareInfos = reactive({});
    const isLoading = ref(true);
    const isContentShrink = ref(false);
    
    let videoHeight = 0;
    let videoPlayer = null;
    
    function onContentSliding(evt){
        videoHeight += evt.delta;
        
        videoPlayer.el().style.height = (videoHeight - evt.offset) + "px";
        videoPlayer.el().style.transition = (evt.transitionable ? "all 300ms" : "none");
    }
    
    function onVideoClick(){
        isContentShrink.value = !isContentShrink.value;
    }
    
    function buildVideoPlayer(){
        window.VIDEOJS_NO_DYNAMIC_STYLE = true; //让 videoJS 不要添加动态样式
        
        videoHeight = window.innerHeight;
        videoPlayer = videojs("videoBox", {
            controls: true,
            loop: false, 
            autoplay: true,
            mute: true
        }, function(){
            //此处的 this 指向 videoPlayer
            //console.log(this);
            this.on("click", onVideoClick);
        });
    }
    
    onActivated(() => {
        const sid = (+$route.query.sid || 0); //share id
        const dat = myStorage.onceObject("user_sharepic_infos_" + sid);
        
        if(dat){
            Object.assign(shareInfos, dat);
            if($store.getters.currentReadPostIds.indexOf(sid) < 0){
                //更新帖子查看次数
                ajaxRequest("updatePostViewCount", { postId: sid }).then(() => {
                    $store.dispatch("addReadPostId", sid);
                });
            }
            isLoading.value = false;
            nextTick(buildVideoPlayer);
        } else {//如果本地没有缓存数据，就到服务器加载！
            ajaxRequest("getPostById", { postId: sid }, true).then(res => {
                Object.assign(shareInfos, res);
                myStorage.onceObject("user_sharepic_infos_" + sid, res);
                isLoading.value = false;
                nextTick(buildVideoPlayer);
            }).catch(() => {
                isLoading.value = false;
            });
        }
    });
    
    onDeactivated(() => {
        if(videoPlayer){
            setTimeout(() => {
                videoPlayer.off("click", onVideoClick);
                videoPlayer.dispose();
                videoPlayer = null;
            }, 500);
        }
    });
    
</script>

<style scoped="scoped">
    .msv-video-box{
        max-height: 100%;
        max-width: 100%;
    }
</style>