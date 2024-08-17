<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0">
            <header class="mni-user-bg">
                <div class="mni-user-profile fx-hc">
                    <img :src="$store.getters.currentUserAvatarUrl" class="mni-user-avatar" alt="用户头像" />
                    <div class="pd-lr-rem5 fx-g1 tc-ff">
                        <h4 class="dp-bk fs-1rem">{{$store.getters.currentUserNickName}}</h4>
                        <p class="mg-t-rem25 fs-rem7">帖子&nbsp;<b>{{postList.length}}</b>&emsp;</p>
                    </div>
                    <button type="button" class="btn-box" style="width:auto" @click="gotoShareAdd"><img :src="publicAssets.iconPublishPost" alt="发贴" class="wh-1em va-tt" />&nbsp;发帖</button>
                </div>
                <lulu-bg-bubble />
            </header>
            <ul v-if="postList.length" class="pd-lr-rem5">
                <li v-for="item in postList" :key="item.id" class="pd-tb-rem5 bd-b-f0 tp-op6">
                    <div class="fx-r" @click="onItemClick(item)">
                        <p class="mni-share-pic">
                            <img :src="item.pictureList[0].thumbnailPath" class="hi-f" onerror="onImageLoadingError()" />
                        </p>
                        <p class="fx-g1 pd-l-rem5 fx-c">
                            <span class="dp-bk fw-b">{{item.title}}</span>
                            <span class="dp-bk fs-rem6 tc-99">{{item.locationAddress}}</span>
                            <span class="dp-bk fs-rem6 tc-99 fx-g1">{{item.authorNickname}}&ensp;{{item.createTime}}</span>
                            <span class="dp-bk fs-rem6 tc-99 ta-r lh-1x">浏览&nbsp;{{item.viewCount}}&emsp;点赞&nbsp;{{item.likesCount}}&emsp;评论&nbsp;{{item.commentCount}}&emsp;分享&nbsp;{{item.shareCount}}</span>
                        </p>
                    </div>
                </li>
            </ul>
            <section v-if="isLoading" class="ta-c pd-1rem">
                <img :src="publicAssets.imageLoadingGif" alt="正在加载" class="dp-ib wh-2rem" />
            </section>
            <section v-else-if="errMsg" class="ta-c pd-1rem">
                <b class="tc-o0">加载出错：</b>
                <b class="tc-red">{{errMsg}}</b>
                <a class="tc-b0 fw-b" @click="onRetry">&emsp;重试</a>
            </section>
            <section v-else-if="isNoMore" class="ta-c pd-1rem">
                <span v-if="postList.length" class="tc-cc">没有更多了~</span>
                <span v-else class="tc-99">你还没有分享过照片~</span>
            </section>
        </div>
    </div>
</template>

<script setup name="MineIndex">
    import { onMounted, reactive, ref } from "vue";
    import { useRouter } from "vue-router";
    import { useStore } from "vuex";
    
    import axios from "axios";
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import luluBgBubble from "@/components/luluBgBubble.vue";
    
    const $router = useRouter();
    const $store = useStore();
    const postList = reactive([]); //帖子列表，支持下拉加载更多！
    const isLoading = ref(false); //是否正在加载
    const isNoMore = ref(false); //是否还有更多数据
    const pageIndex = ref(0); //第几页
    const errMsg = ref(null); //加载时的错误文本信息
    
    function gotoShareAdd(){
        $router.push("/shareadd");
    }
    function getPostList(){
        if(isLoading.value || isNoMore.value){
            return;
        } else {
            isLoading.value = true;
        }
        
        pageIndex.value++;
        
        //2024年8月16日，获取用户分享的照片
        axios.get(publicAssets.sharePicsData).then(res => {
            if(res.data && res.data.length){
                postList.push(...res.data);
            }
            isLoading.value = false;
            isNoMore.value = true;
            errMsg.value = null;
        }).catch(err => {
            errMsg.value = err.message;
            isLoading.value = false;
            isNoMore.value = false;
        });
    }
    function onRetry(){
        isNoMore.value = false;
        errMsg.value = null;
        getPostList();
    }
    function onItemClick(item){
        //数据量有点大，保存在临时存储里
        myStorage.onceObject("user_sharepic_infos", item);
        $router.push("/map3ddetails?sid=" + item.id);
    }
    
    onMounted(getPostList);
</script>

<style scoped="scoped">
    .mni-user-bg{
        height: 25%;
        position: relative;
    }
    .mni-user-profile{
        position: absolute;
        left: 0.5rem;
        right: 0.5rem;
        bottom: 1rem;
        z-index: 8;
    }
    .mni-user-avatar{
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        border: 0.15rem solid #fff;
    }
    .mni-share-pic{
        width: 4.2rem;
        height: 4.2rem;
        border-radius: 0.3rem;
        overflow: hidden;
        background-color: #eee;
    }
</style>