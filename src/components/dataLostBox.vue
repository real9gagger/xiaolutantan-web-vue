<template>
    <div style="padding-top:15vh">
        <h4 class="fs-1rem tc-33 ta-c">{{props.title}}</h4>
        <img :src="publicAssets.imageImgLost" class="dlb-pic-box" />
        <a class="dp-bk tc-b0 ta-c fw-b" @click="onGotoPrevPage">返回上一页</a>
    </div>
</template>

<script setup name="DataLostBox">
    import { defineProps } from "vue";
    import { useRouter } from "vue-router";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const props = defineProps({
        title: {
            type: String,
            default: "数据已丢失"
        }
    });
    const $router = useRouter();

    function onGotoPrevPage(){
        $router.back();
    }
</script>

<style>
    .dlb-pic-box{
        display:block;
        margin:2rem auto;
        width:10rem;
        height:auto;
    }
</style>