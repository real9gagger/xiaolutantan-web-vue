<template>
    <div class="page-limit-width">
        <div class="content-cage no-tbpd">
            <ul>
                <li v-for="item,idx in userList" :key="item.nickName" class="fx-hc pd-tb-rem5 bd-b-f0" @click="onItemClicked(idx)">
                    <img :src="item.avatarUrl" alt="用户头像" class="upk-avatar-box" />
                    <b class="pd-lr-1rem fx-g1" :class="{'tc-mc': selectedIndex===idx}">{{item.nickName}}</b>
                    <img v-if="selectedIndex===idx" :src="publicAssets.iconCheckV" alt="选中打勾" class="wh-1rem" />
                </li>
            </ul>
        </div>
        <div class="ps-f po-blr-0 ta-c fs-rem6 tc-66 pd-rem5">以上账户为临时账户，非用户注册的账户！</div>
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
            nickName: "平平",
            avatarUrl: publicAssets.imageAvatarPingping
        },
        {
            nickName: "坦坦",
            avatarUrl: publicAssets.imageAvatarTantan
        },
        {
            nickName: "鹿鹿",
            avatarUrl: publicAssets.imageAvatarLulu
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
</style>