<template>
    <div class="page-limit-width">
        <ul class="content-cage" style="padding:0 1rem">
            <li v-for="item,idx in userList" :key="item.nickName" class="fx-hc pd-tb-rem5 bd-b-f0 tp-op6" @click="onItemClicked(idx)">
                <img :src="item.avatarUrl" alt="用户头像" class="upk-avatar-box" />
                <b class="pd-l-1rem" :class="{'tc-mc': selectedIndex===idx}">{{item.nickName}}</b>
                <sup v-if="item.isAdmin" class="upk-admin-badge">超级管理员</sup>
                <span class="fx-g1"><!-- 占位用 --></span>
                <img v-if="selectedIndex===idx" :src="publicAssets.iconCheckV" alt="选中打勾" class="wh-1rem" />
            </li>
        </ul>
        <div class="ps-f po-blr-0 ta-c fs-rem6 tc-o0 pd-rem5"><b>以上作者为临时账户，非用户注册的账户！</b></div>
    </div>
</template>

<script setup name="MineUserPicker">
    import { ref } from "vue";
    import { useStore } from "vuex";
    import { useRouter } from "vue-router";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $store = useStore();
    const $router = useRouter();
    const userList = [
        {
            nickName: "火星人",
            avatarUrl: publicAssets.imageAvatarAdmin,
            isAdmin: true
        },
        {
            nickName: "平平",
            avatarUrl: publicAssets.imageAvatarPingping,
            isAdmin: false
        },
        {
            nickName: "坦坦",
            avatarUrl: publicAssets.imageAvatarTantan,
            isAdmin: false
        },
        {
            nickName: "鹿鹿",
            avatarUrl: publicAssets.imageAvatarLulu,
            isAdmin: false
        }
    ];
    const selectedIndex = ref(userList.findIndex(vx => vx.nickName === $store.getters.pickUserNickName));
    
    function onItemClicked(idx){
        selectedIndex.value = idx;
        $store.dispatch("setPickUserInfo", userList[idx]);
        $router.back();
    }
</script>

<style scoped="scoped">
    .upk-avatar-box{
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
    }
    .upk-admin-badge{
        background-image: linear-gradient(90deg, #f90 0%, #f60 100%);
        color: #fff;
        border-radius: 0.5rem 0.5rem 0.5rem 0;
        padding: 0.2rem 0.4rem;
        font-size: 0.5rem;
        margin-left: 0.3rem;
        line-height: 1;
    }
</style>