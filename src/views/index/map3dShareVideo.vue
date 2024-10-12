<template>
    <div class="page-limit-width">
        <template v-if="shareInfos && shareInfos.id">
            <div class="content-cage" style="padding:0;overflow:hidden;background-color:#000">
                <div class="wi-f fx-vm" :style="videoStyle">
                    <video
                        :src="shareInfos.pictureList[0].picPath"
                        :poster="shareInfos.pictureList[0].thumbnailPath"
                        class="msv-video-box"
                        autoplay="autoplay" 
                        muted="muted" 
                        controls="controls" />
                </div>
            </div>
            <content-slide-box
                :user-avatar="shareInfos.authorAvatarUrl"
                :user-nickname="shareInfos.authorNickname"
                :sub-title="shareInfos.createTime + ' • 拍摄于' + shareInfos.locationAddress + '附近'"
                :content="shareInfos.title"
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
    import { ref, reactive, getCurrentInstance, onActivated, computed } from "vue";
    import { useStore } from "vuex";
    import { useRoute, useRouter } from "vue-router";
    import myStorage from "@/utils/mystorage.js";
    import ajaxRequest from "@/request/index.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import dataLostBox from "@/components/dataLostBox.vue";
    import contentSlideBox from "@/components/contentSlideBox.vue";
    
    const $route = useRoute();
    const $router = useRouter();
    const $store = useStore();
    const shareInfos = reactive({});
    const isLoading = ref(true);
    const videoHeight = ref(window.innerHeight);
    const videoOffset = ref(0);
    const videoTransitionable = ref(false);
    
    const videoStyle = computed(() => ({
        height: videoHeight.value + "px",
        paddingBottom: videoOffset.value + "px",
        transition: videoTransitionable.value ? "all 300ms" : "none"
    }));
    
    function onContentSliding(evt){
        videoHeight.value += evt.delta;
        videoOffset.value = evt.offset;
        videoTransitionable.value = evt.transitionable;
        console.log(evt);
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
    .msv-video-box{
        max-height: 100%;
        max-width: 100%;
    }
</style>