<template>
    <div class="page-limit-width">
        <template v-if="shareInfos && shareInfos.id">
            <div class="content-cage" style="padding:0;overflow:hidden;background-color:#000;height:100%">
                <video
                    :src="shareInfos.pictureList[0].picPath"
                    :poster="shareInfos.pictureList[0].thumbnailPath"
                    id="videoBox"
                    class="msv-video-box video-js"
                    style="width:100%;height:100%;outline:none">浏览器不支持 HTML5 Video</video>
            </div>
            <content-slide-box
                ref="csbRef"
                :user-avatar="shareInfos.authorAvatarUrl"
                :user-nickname="shareInfos.authorNickname"
                :sub-title="shareInfos.createTime + ' • 拍摄于' + shareInfos.locationAddress + '附近'"
                :content="shareInfos.title"
                :is-shrink="isContentShrink"
                @sliding="onContentSliding"
                @avatarclick="onUserAvatarClick"
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
    import { ref, reactive, getCurrentInstance, onActivated, onDeactivated, computed, nextTick, onBeforeUnmount } from "vue";
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
    const csbRef = ref(null);
    
    let videoHeight = 0;
    let videoPlayer = null;
    
    function onContentSliding(evt){
        videoHeight += evt.delta;
        
        videoPlayer.el().style.height = (videoHeight - evt.offset) + "px";
        videoPlayer.el().style.transition = (evt.transitionable ? "all 300ms" : "none");
    }
    
    function onUserAvatarClick(){
        if($route.query.ogpg === "USER_CENTER"){
            $router.back();
        } else {
            $router.push("/user?uid=" + encodeURIComponent(shareInfos.authorNickname));
        }
    }
    
    function onVideoClick(evt){
        //点击视频组件才能生效
        if(evt.target.tagName === "VIDEO"){
            isContentShrink.value = !isContentShrink.value;
            nextTick(() => videoPlayer.userActive(!csbRef.value.checkWhetherHide())); //随便隐藏或显示控制条
        }
    }
    
    function buildVideoPlayer(){
        if(!videoPlayer){
            window.VIDEOJS_NO_DYNAMIC_STYLE = true; //让 videoJS 不要添加动态样式
            videoHeight = window.innerHeight;
            
            //配置项参考：https://gitcode.gitcode.host/docs-cn/video.js-docs-cn/docs/guides/options.html#useractionsclick
            videoPlayer = videojs("videoBox", {
                controls: true,
                loop: false, 
                autoplay: true,
                mute: true,
                inactivityTimeout: 0, //不自动隐藏控制条
                userActions: { click: false } //禁止点击视频时播放或暂停
            }, function(){
                //此处的 this 指向 videoPlayer
                if(IS_MOBILE){
                    this.on("touchend", onVideoClick);
                } else {
                    this.on("click", onVideoClick);
                }
            });
            console.log("创建了视频组件...");
        } else if(videoPlayer.currentSrc().endsWith(shareInfos.pictureList[0].picPath)){
            videoPlayer.play();
            console.log("继续播放视频内容...");
        } else {
            //参考文档：https://docs.videojs.com/docs/api/player.html#Methodsposter
            videoPlayer.reset();
            videoPlayer.src({
                type: shareInfos.pictureList[0].mimeType,
                src: shareInfos.pictureList[0].picPath
            });
            videoPlayer.poster(shareInfos.pictureList[0].thumbnailPath);
            videoPlayer.load();
            videoPlayer.play();
            console.log("更新了视频内容...");
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
                videoPlayer.pause();
                console.log("视频已暂停播放...");
            }, 300);
        }
    });
    
    onBeforeUnmount(() => {
        if(videoPlayer){
            setTimeout(() => {
                videoPlayer.off("click", onVideoClick);
                videoPlayer.off("touchend", onVideoClick);
                videoPlayer.dispose();
                videoPlayer = null;
                console.log("视频内容已销毁...");
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