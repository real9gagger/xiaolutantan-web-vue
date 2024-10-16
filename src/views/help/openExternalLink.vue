<template>
    <div class="page-limit-width">
        <div class="content-cage lh-1x8">
            <template v-if="theLink">
                <p class="oel-link-box">
                    <span>您将打开外部链接：</span>
                    <a class="tc-b0" :href="theLink" target="_blank">{{theLink}}&ensp;</a>
                    <img :src="publicAssets.iconExternalLink" @click="onOpenLink" alt="外部链接" class="wh-1em cs-p" />
                </p>
                <button class="btn-box mg-t-2rem" @click="onOpenLink">确定打开外部链接</button>
                <a class="dp-bk mg-t-2rem tc-99 ta-c" @click="onGoBack">返回</a>
            </template>
            <template v-else>
                <p class="oel-link-box fx-hc">
                    <span class="fx-g1">参数错误，未能识别到有效链接</span>
                    <img :src="publicAssets.iconMsgError" alt="参数错误" class="wh-1rem" />
                </p>
                <button class="btn-box mg-t-2rem" @click="onGoBack">返回</button>
            </template>
        </div>
    </div>
</template>

<script setup name="HelpOpenExternalLink">
    import { onMounted, ref } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $route = useRoute();
    const $router = useRouter();
    const theLink = ref("");
    
    function onOpenLink(){
        window.open(theLink.value, "_blank");
    }
    
    function onGoBack(){
        $router.back();
    }
    
    onMounted(() => {
        theLink.value = decodeURIComponent($route.query.link || "");
    });
</script>

<style scoped="scoped">
    .oel-link-box{
        background-color: #fff0f0;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 0.05rem solid red;
        word-break: break-all;
    }
</style>