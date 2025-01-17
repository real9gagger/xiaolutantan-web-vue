<template>
    <genz-scroll-view
    :lower-disabled="true"
    :lower-immediately="false"
    class="page-limit-width">
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
            <ul v-if="postList.length">
                <my-post-list-item v-for="item,index in postList" 
                    :key="item.id"
                    :item-info="item"
                    :item-index="index"
                    @longtap="onItemLongTap"
                    @itemtap="onItemClick"
                />
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
    </genz-scroll-view>
</template>

<script setup name="MineIndex">
    import { onMounted, reactive, ref, watch } from "vue";
    import { useRouter } from "vue-router";
    import { useStore } from "vuex";
    import { appWebName } from "@/assets/data/constants.js"
    
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import luluBgBubble from "@/components/luluBgBubble.vue";
    import actionPopup from "@/components/actionPopup.vue";
    import myPostListItem from "@/listitems/myPostListItem.vue";
    import ajaxRequest from "@/request/index.js";
    
    const $router = useRouter();
    const $store = useStore();
    const postList = reactive([]); //帖子列表，支持下拉加载更多！
    const isLoading = ref(false); //是否正在加载
    const isNoMore = ref(false); //是否还有更多数据
    const pageIndex = ref(0); //第几页
    const errMsg = ref(null); //加载时的错误文本信息
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
            hidden: false,
            dangerous: true
        }
    ]);
    const nonRVs = { //非响应式变量（non Responsive Variables）
        selectItemIndex: 0
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
    function onItemLongTap(idx){
        const item = postList[idx];
        
        for(const vx of popupButtons){
            switch(vx.key){
                case 0x007: vx.hidden = (item.status !== 1); break;
                case 0x008: vx.hidden = (item.status === 1); break;
            }
        }
        
        popupTitle.value= item.title.substr(0, 50);
        popupVisible.value = true;
        nonRVs.selectItemIndex = idx;
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
                    postId: postList[nonRVs.selectItemIndex].id,
                    newStatus: 0
                }).then(() => {
                    $store.dispatch("setThereAreNewPosts", true);
                    appToast("已设为仅自己可见");
                });
                break;
            case 0x008: 
                ajaxRequest("toggleMyPostStatus", {
                    postId: postList[nonRVs.selectItemIndex].id,
                    newStatus: 1
                }).then(() => {
                    $store.dispatch("setThereAreNewPosts", true);
                    appToast("已设为全部人可见");
                });
                break;
            case 0x009: 
                alertConfirm("删除帖子", "删除", true).then(() => {
                    ajaxRequest("deleteMyPost", {
                        postId: postList[nonRVs.selectItemIndex].id,
                        deleteTs: Date.now()
                    }).then(() => {
                        $store.dispatch("setThereAreNewPosts", true);
                        appToast("已删除");
                    });
                }).catch(globalEmptyShell);
                break;
            case 0x100:
                window.open(postList[nonRVs.selectItemIndex].pictureSourceUrl, "_blank");
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
</style>