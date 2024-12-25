<template>
    <div class="page-limit-width">
        <template v-if="shareInfos && shareInfos.id">
            <video v-if="isWx"
                src="@/assets/video/a_blood_moon.webm"
                ref="tempVideoRef"
                width="390"
                height="480"
                autoplay="true"
                muted="true"
                loop="true"
                class="ps-f po-tl-0 zi-0 op-0">【2024年12月23日】
            【注意】这个隐藏的视频控件的目的是：处理微信内置浏览器全屏时自动旋转的问题。
            由于微信内置浏览器会根据视频的宽高（视频高度大于宽度时），全屏时会自动旋转视频。
            别的浏览器调用 document.documentElement.requestFullScreen()，且视频高度大于宽度时，就不会自动旋转。
            但是微信这个垃圾内置浏览器就自动旋转视频！我又不是掉用 video.requestFullScreen()，为啥给我旋转屏幕！
            【这个控件必须放在页面顶部，就是页面内的第一个视频。我调用全屏的代码在组件 videoSwiperItem 里，不在这个页面】
            【垃圾微信，坚决抵制，永不开发小程序，希望尽快倒闭，解放码牛】</video>
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
    import { makeThemeColorDark, makeThemeColorLight, toggleFullScreen } from "@/utils/pagehelper.js";
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
    const tempVideoRef = ref(null);
    const isWx = (IS_MOBILE && IS_WECHAT);
    
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
    
    //修复微信内置浏览器退出全屏后系统导航栏无法复原的问题！
    function fixWechatBugAfterExitFullscreen(isRestore){
        /** 【2024年12月25日 bug描述（本人使用三星手机S24+，其他厂商手机有没有这个问题暂不知道）】
         * 微信内置浏览器全屏后，再次退出全屏时，底部系统导航栏无法还原，但是可以看到安卓的三个按键（系统导航栏变成了类似CSS的固定定位了）。导致遮住了视频底部进度条。
         * 其他浏览器暂时没有发现这个问题。就是微信这个垃圾货有这个问题！
         * 【2024年12月25日 解决方法】
         * 退出全屏前，暂停播放所有视频。成功退出全屏后再重新播放所有视频
         * 注意：比如当前页面有10部视频，那就必须在全屏前暂停播放这10部视频，退出全屏后再重新播放这些视频！
        */
        if(tempVideoRef.value && videoPlayer){
            if(isRestore){
                tempVideoRef.value.play();
                videoPlayer.play();
            } else {
                tempVideoRef.value.pause();
                videoPlayer.pause();
            }
        }
    }
    
    function onVideoClick(evt){
        //点击视频组件才能生效
        if(evt.target.tagName === "VIDEO"){
            if(tempVideoRef.value && document.fullscreenElement){//移动端微信内置浏览器，并且是将要退出全屏时才处理
                fixWechatBugAfterExitFullscreen(false);
                setTimeout(fixWechatBugAfterExitFullscreen, 50, true);
            }
            isContentShrink.value = !isContentShrink.value;
            toggleFullScreen(isContentShrink.value);
            nextTick(() => videoPlayer.userActive(!csbRef.value.checkWhetherHide())); //随便隐藏或显示控制条
        }
    }
    
    function letsStartPlayVideo(){
        if(tempVideoRef.value){//这块代码必须放在顶部
            tempVideoRef.value.play();
        }
        if(videoPlayer && videoPlayer.paused()){
            videoPlayer.play().catch(globalEmptyShell);
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
            setTimeout(letsStartPlayVideo, 100);
            console.log("创建了视频组件...");
        } else if(videoPlayer.currentSrc().endsWith(shareInfos.pictureList[0].picPath)){
            letsStartPlayVideo();
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
            letsStartPlayVideo();
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
        makeThemeColorDark();
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
        makeThemeColorLight();
    });
</script>

<style scoped="scoped">
    .msv-video-box{
        max-height: 100%;
        max-width: 100%;
    }
</style>