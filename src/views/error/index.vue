<template>
    <div class="hi-cwh fx-vm">
        <h4 class="tc-red fs-1rem2">SERVER ERROR</h4>
        <img :src="publicAssets.imageServerError" style="width:10rem;height:10rem;margin:1rem 0;" />
        <div class="fw-b fs-1rem">
            <a @click="goHome" class="tc-mc">返回主页</a>
            <a @click="backPage" class="tc-mc mg-l-2rem">返回上一页</a>
        </div>
        <div class="error-copy-right">{{appWebName}}@2024</div>
    </div>
</template>

<script setup name="ErrorIndex">
    import { useRouter } from "vue-router";
    import { appWebName } from "@/assets/data/constants.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $router = useRouter();
    
    function backPage() {
        $router.go(-1);
    }
    function goHome() {
        $router.replace("/");
    }
</script>

<style scoped="scoped">
    .error-copy-right {
        text-align: center;
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0.5rem;
        color: #ccc;
        font-size: 0.6rem;
    }
</style>