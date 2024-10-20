<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0">
            <header class="mnu-user-bg">
                <div class="mnu-user-profile fx-hc">
                    <img :src="postList.length ? postList[0].authorAvatarUrl : publicAssets.iconDefaultUserAvatar" class="mnu-user-avatar" alt="用户头像" />
                    <div class="pd-lr-rem5 fx-g1 tc-ff">
                        <h4 class="dp-bk fs-1rem">{{postList.length ? postList[0].authorNickname : appWebName}}</h4>
                        <p class="mg-t-rem25 fs-rem7">帖子&nbsp;<b>{{postList.length}}</b>&emsp;</p>
                    </div>
                </div>
                <lulu-bg-bubble />
            </header>
            <ul v-if="postList.length">
                <li v-for="item,index in postList" :key="item.id" class="pd-rem5 bd-b-f0 tp-f0 cs-p" @click="onItemClick(index)">
                    <div class="fx-r">
                        <p class="mnu-share-pic">
                            <img :src="item.pictureList[0].thumbnailPath" class="hi-f" onerror="onImageLoadingError()" />
                            <span v-if="item.pictureList.length > 1" class="mnu-pic-count">+{{item.pictureList.length - 1}}</span>
                            <img v-if="item.isVideo" :src="publicAssets.iconPlayVideo" alt="视频内容" class="ps-a po-tl-0 wh-f" />
                            <span v-if="item.isVideo" class="mnu-pic-count">{{getFriendlyDuration(item.pictureList[0].duration)}}</span>
                        </p>
                        <p class="fx-g1 ps-r pd-l-rem5 fx-c">
                            <span class="of-lc1 fw-b">{{item.title}}</span>
                            <span class="of-lc1 fs-rem6 tc-99 pd-tb-rem25">{{item.locationAddress}}</span>
                            <span class="dp-bk fs-rem6 tc-99 fx-g1">{{item.authorNickname}}&ensp;{{item.createTime}}</span>
                        </p>
                    </div>
                </li>
            </ul>
            <section v-if="isLoading" class="ta-c pd-1rem">
                <img :src="publicAssets.svgLoadingGif" alt="正在加载" class="dp-ib wh-2rem" />
            </section>
            <section v-else-if="errMsg" class="ta-c pd-1rem">
                <b class="tc-o0">加载出错：</b>
                <b class="tc-r0">{{errMsg}}</b>
                <a class="tc-b0 fw-b" @click="onRetry">&emsp;重试</a>
            </section>
            <section v-else-if="isNoMore" class="ta-c pd-1rem">
                <span v-if="postList.length" class="tc-cc">没有更多了~</span>
                <span v-else class="tc-99">他还没有分享过照片~</span>
            </section>
        </div>
    </div>
</template>

<script setup name="MineUser">
    import { onMounted, reactive, ref } from "vue";
    import { useRouter, useRoute } from "vue-router";
    import { appWebName } from "@/assets/data/constants.js"
    import { getFriendlyDuration } from "@/utils/pagehelper.js";
    
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import luluBgBubble from "@/components/luluBgBubble.vue";
    import ajaxRequest from "@/request/index.js";
    
    const $router = useRouter();
    const $route = useRoute();
    const postList = reactive([]); //帖子列表，支持下拉加载更多！
    const isLoading = ref(false); //是否正在加载
    const isNoMore = ref(false); //是否还有更多数据
    const pageIndex = ref(0); //第几页
    const errMsg = ref(null); //加载时的错误文本信息

    function getPostList(){
        if(isLoading.value || isNoMore.value){
            return;
        } else {
            isLoading.value = true;
        }
        
        pageIndex.value++;
        
        //2024年8月16日，获取用户分享的照片
        ajaxRequest("getUserPostByUid", { userId: $route.query.uid }, true).then(res => {
            if(res && res.length){
                postList.push(...res);
            }
            isLoading.value = false;
            isNoMore.value = true;
            errMsg.value = null;
        }).catch(err => {
            errMsg.value = err;
            isLoading.value = false;
            isNoMore.value = false;
        });
    }
    function onRetry(){
        isLoading.value = false;
        isNoMore.value = false;
        pageIndex.value = 0;
        errMsg.value = null;
        postList.splice(0);
        getPostList();
    }
    function onItemClick(idx){
        const item = postList[idx];
        //数据量有点大，保存在临时存储里
        myStorage.onceObject("user_sharepic_infos_" + item.id, item);
        if(!item.isVideo){//照片内容
            $router.push("/map3ddetails?ogpg=USER_CENTER&sid=" + item.id);
        } else {//视频内容
            $router.push("/map3dvideo?ogpg=USER_CENTER&sid=" + item.id);
        }
    }
    
    onMounted(getPostList);
</script>

<style scoped="scoped">
    .mnu-user-bg{
        height: 20vh;
        position: relative;
    }
    .mnu-user-profile{
        position: absolute;
        left: 0.5rem;
        right: 0.5rem;
        bottom: 1rem;
        z-index: 8;
    }
    .mnu-user-avatar{
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        border: 0.15rem solid #fff;
    }
    .mnu-share-pic{
        width: 4.2rem;
        height: 4.2rem;
        border-radius: 0.3rem;
        overflow: hidden;
        background-color: #eee;
        text-align: center;
        position: relative;
    }
    .mnu-pic-count{
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