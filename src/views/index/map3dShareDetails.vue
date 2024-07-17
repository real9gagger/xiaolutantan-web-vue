<template>
    <div v-if="shareInfos && shareInfos.id===shareID">
        <div class="msd-userinfo-box">
            <img class="msd-user-avatar" :src="publicAssets.iconDefaultUserAvatar" />
            <div class="mg-l-rem5 fx-g1">
                <span class="dp-bk fw-b" title="分享这张照片的用户的名称">{{shareInfos.authorNickname}}</span>
                <span class="dp-bk fs-rem6 tc-33" title="分享这张照片的时间">{{shareInfos.createTime}}</span>
                <span class="dp-bk fs-rem6 tc-33" title="拍摄这张照片的地点">拍摄于 {{shareInfos.locationAddress}} 附近</span>
            </div>
        </div>
        <div class="msd-bottom-box fx-c fx-je">
            <span class="dp-bk">{{shareInfos.pictureList[picIndex].description || shareInfos.title}}</span>
        </div>
    </div>
</template>

<script setup name="IndexMap3DShareDetails">
    import { ref } from "vue";
    import { useRoute } from "vue-router";
    import myStorage from "@/utils/mystorage.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $route = useRoute();
    const shareInfos = myStorage.onceObject("user_sharepic_infos");
    const shareID = (+$route.query.sid || 0);
    const picIndex = ref(0);
</script>

<style scoped="scoped">
    .msd-userinfo-box{
        display: flex;
        flex-direction: row;
        position: fixed;
        padding: 0.5rem 1rem;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9;
        background-image: linear-gradient(0deg,rgba(255,255,255,0),rgba(255,255,255,0.7));
    }
    .msd-user-avatar{
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        border: 0.1rem solid #fff;
    }
    .msd-bottom-box{
        position: fixed;
        padding: 0.5rem 1rem;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10;
        min-height: 5rem;
        background-image: linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.7));
    }
</style>