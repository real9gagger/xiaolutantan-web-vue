<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0">
            <header class="mni-user-bg">
                <div class="mni-user-profile fx-hc">
                    <img :src="$store.getters.currentUserAvatarUrl || publicAssets.iconDefaultUserAvatar" @click="onLogout" class="mni-user-avatar" alt="用户头像" />
                    <div class="pd-lr-rem5 fx-g1 tc-ff" @click="onLogout">
                        <h4 class="dp-bk fs-1rem">{{$store.getters.currentUserNickName || appWebName}}</h4>
                        <p class="mg-t-rem25 fs-rem7">帖子&nbsp;<b>{{postList.length}}</b>&emsp;</p>
                    </div>
                    <button type="button" class="btn-box" style="width:auto" @click="gotoShareAdd"><img :src="publicAssets.iconPublishPost" alt="发贴" class="wh-1em va-tt" />&nbsp;发帖</button>
                </div>
                <lulu-bg-bubble />
            </header>
            <ul v-if="postList.length" @touchstart="preventContextMenu">
                <li v-for="item,index in postList" :key="item.id" class="ps-r pd-rem5 bd-b-f0 cs-p" @pointerdown="onItemPointerDown(index)" @pointerup="onItemPointerUp(index)" @pointercancel="onItemPointerLeave" @pointerleave="onItemPointerLeave">
                    <div class="fx-r ps-r zi-1">
                        <p class="mni-share-pic">
                            <img :src="item.pictureList[0].thumbnailPath" class="hi-f" onerror="onImageLoadingError()" />
                            <span v-if="item.pictureList.length > 1" class="mni-pic-count">+{{item.pictureList.length - 1}}</span>
                            <img v-if="item.isVideo" :src="publicAssets.iconPlayVideo" alt="视频内容" class="ps-a po-tl-0 wh-f" />
                            <span v-if="item.isVideo" class="mni-pic-count">{{getFriendlyDuration(item.pictureList[0].duration)}}</span>
                        </p>
                        <p class="fx-g1 ps-r pd-l-rem5 fx-c">
                            <span class="of-lc1 fw-b">{{item.title}}</span>
                            <span class="of-lc1 fs-rem6 tc-99">{{item.locationAddress}}</span>
                            <span class="dp-bk fs-rem6 tc-99 fx-g1">{{item.authorNickname}}&ensp;{{item.createTime}}</span>
                            <span class="dp-bk fs-rem6 tc-99 ta-r lh-1x">浏览 {{item.viewCount}}&emsp;点赞 {{item.likesCount}}&emsp;评论 {{item.commentCount}}&emsp;收藏 {{item.collectCount}}<!-- &emsp;分享 {{item.shareCount}} --></span>
                            <span class="dp-bk fs-rem6 tc-o0 lh-1x ps-a po-bl-0 pd-l-rem5" v-if="item.status !== 1">仅自己可见</span>
                        </p>
                    </div>
                    <div v-show="activeIndex===index" class="mni-item-bg"><!-- 背景 --></div>
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
                <span v-else class="tc-99">你还没有分享过照片~</span>
            </section>
        </div>
        <action-popup v-model="popupVisible" :title="popupTitle" :buttons="popupButtons" @action="onPopupAction" />
    </div>
</template>

<script setup name="MineIndex">
    import { onMounted, reactive, ref, watch } from "vue";
    import { useRouter } from "vue-router";
    import { useStore } from "vuex";
    import { appWebName } from "@/assets/data/constants.js"
    import { needDebounce, clearTimer } from "@/utils/cocohelper.js";
    import { getFriendlyDuration } from "@/utils/pagehelper.js";
    
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import luluBgBubble from "@/components/luluBgBubble.vue";
    import actionPopup from "@/components/actionPopup.vue";
    import ajaxRequest from "@/request/index.js";
    
    const $router = useRouter();
    const $store = useStore();
    const postList = reactive([]); //帖子列表，支持下拉加载更多！
    const isLoading = ref(false); //是否正在加载
    const isNoMore = ref(false); //是否还有更多数据
    const pageIndex = ref(0); //第几页
    const errMsg = ref(null); //加载时的错误文本信息
    const activeIndex = ref(-1); //当前点击的项
    const popupVisible = ref(false);
    const popupTitle = ref("");
    const popupButtons = reactive([
        {
            name: "转到照片来源",
            key: 0x100,
            hidden: false
        },
        {
            name: "仅自己可见",
            key: 0x007,
            hidden: false
        },
        {
            name: "全部人可见",
            key: 0x008,
            hidden: true
        },
        {
            name: "删除",
            key: 0x009,
            hidden: false
        }
    ]);
    const nonRVs = { //非响应式变量（non Responsive Variables）
        pointerDownTS: 0,
        selectItemID: 0
    };
    
    function gotoShareAdd(){
        $router.push("/shareadd");
    }
    function getPostList(cached){
        if(isLoading.value || isNoMore.value){
            return;
        } else {
            isLoading.value = true;
        }
        
        pageIndex.value++;
        
        //2024年8月16日，获取用户分享的照片
        ajaxRequest("getMyPostList", null, cached !== false).then(res => {
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
        getPostList(false);
    }
    function onItemPointerDown(idx){
        const item = postList[idx];
        
        nonRVs.pointerDownTS = Date.now();
        activeIndex.value = idx;
        
        needDebounce(() => {
            for(const vx of popupButtons){
                switch(vx.key){
                    case 0x007: vx.hidden = (item.status !== 1); break;
                    case 0x008: vx.hidden = (item.status === 1); break;
                }
            }
            
            navigator.vibrate(30);
            popupTitle.value= item.title.substr(0, 50);
            popupVisible.value = true;
            
            nonRVs.selectItemID = item.id;
        }, 500);
    }
    function onItemPointerUp(idx){
        const delta = (Date.now() - nonRVs.pointerDownTS);
        
        clearTimer(true);

        if(delta < 300 && window.event.button === 0){ //点击事件。鼠标左键按下时才有效
            const item = postList[idx];
            //数据量有点大，保存在临时存储里
            myStorage.onceObject("user_sharepic_infos_" + item.id, item);
            if(!item.isVideo){//照片内容
                $router.push("/map3ddetails?ogpg=USER_CENTER&sid=" + item.id);
            } else {//视频内容
                $router.push("/map3dvideo?ogpg=USER_CENTER&sid=" + item.id);
            }
        }
        
        activeIndex.value = -1;
    }
    function onItemPointerLeave(){
        clearTimer(true);
        activeIndex.value = -1;
    }
    function preventContextMenu(evt){
        //evt.preventDefault(); //阻止浏览器弹出 “翻译、全选、复制、搜索...” 菜单
    }
    function onLogout(){
        alertConfirm("退出登录", "确定").then(() => {
            $store.dispatch("setUserInfo", null);
            $router.back();
        }).catch(globalEmptyShell);
    }
    function onPopupAction(key){
        switch(key){
            case 0x007: 
                ajaxRequest("toggleMyPostStatus", {
                    postId: nonRVs.selectItemID,
                    newStatus: 0
                }).then(() => {
                    $store.dispatch("setThereAreNewPosts", true);
                    appToast("已设为仅自己可见");
                });
                break;
            case 0x008: 
                ajaxRequest("toggleMyPostStatus", {
                    postId: nonRVs.selectItemID,
                    newStatus: 1
                }).then(() => {
                    $store.dispatch("setThereAreNewPosts", true);
                    appToast("已设为全部人可见");
                });
                break;
            case 0x009: 
                alertConfirm("删除帖子", "删除", true).then(() => {
                    ajaxRequest("deleteMyPost", {
                        postId: nonRVs.selectItemID,
                        deleteTs: Date.now()
                    }).then(() => {
                        $store.dispatch("setThereAreNewPosts", true);
                        appToast("已删除");
                    });
                }).catch(globalEmptyShell);
                break;
            case 0x100:
                window.open(postList[activeIndex.value].pictureSourceUrl, "_blank");
                break;
        }
    }
    
    watch(() => $store.getters.thereAreNewPostsTs, onRetry);
    
    onMounted(getPostList);
</script>

<style scoped="scoped">
    .mni-user-bg{
        height: 20vh;
        position: relative;
    }
    .mni-user-profile{
        position: absolute;
        left: 0.5rem;
        right: 0.5rem;
        bottom: 0.5rem;
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
        text-align: center;
        position: relative;
    }
    .mni-pic-count{
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
    .mni-item-bg{
        position: absolute;
        inset: 0;
        z-index: 0;
        background-color: rgba(240, 240, 240, 1);
    }
</style>