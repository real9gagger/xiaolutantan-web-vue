<template>
    <div class="page-limit-width">
        <div class="content-cage ta-c abu-bg-box">
            <div class="abu-bg-mask"></div>
            <div style="height:10vh"><!-- 占位用 --></div>
            <h4 class="dp-ib ps-r zi-1">
                <text-with-border class="fs-2rem" ctcss="abu-the-words" content="「一起去旅行吧」" bdcolor="#fff" />
                <text-with-border class="fs-1rem ta-r pd-r-2rem" ctcss="abu-the-words" :content="`——— ${appWebName}`" bdcolor="#fff" />
            </h4>
            <text-with-border class="mg-t-2rem fs-1rem tc-33" content="联系邮箱" bdcolor="#fff" />
            <text-with-border class="fs-1rem tc-33" :content="contactEmail" bdcolor="#fff" />
            <text-with-border class="mg-t-2rem fs-1rem tc-33" content="联系人" bdcolor="#fff" />
            <text-with-border class="fs-1rem tc-33" :content="myName" bdcolor="#fff" />
            <text-with-border class="mg-t-2rem fs-1rem tc-b1" content="捐助»" @click="gotoDonatePage" bdcolor="#fff" />
            <text-with-border class="fs-1rem tc-b1" :content="donateWords"  @click="gotoDonatePage" bdcolor="#fff" />
        </div>
        <div class="abu-copyright-box" @click="gotoTestPage">{{appWebName}}@{{theYear}}</div>
    </div>
</template>

<script setup name="HelpAboutUs">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import { appWebName, donateWords, contactEmail } from "@/assets/data/constants.js";
    import textWithBorder from "@/components/textWithBorder.vue";
    
    const $router = useRouter();
    const myName = ref("18249948080/张先生");
    const theYear = new Date().getFullYear();
    
    function gotoDonatePage(){
        $router.push("/donate");
    }
    
    function gotoTestPage(){
        $router.push("/test");
    }
</script>

<style scoped="scoped">
    .abu-bg-box{
        background-image: var(--bg-about-us-bg);
        background-position: 50% 50%;
        background-size: 100% auto;
        background-repeat: repeat;
    }
    .abu-bg-mask{
        position: absolute;
        inset: 0;
        z-index: 0;
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(0.1rem);
    }
    .abu-copyright-box{
        position: absolute;
        left: 0;
        bottom: 0.5rem;
        right: 0;
        z-index: 1;
        font-size: 0.6rem;
        text-align: center;
        color: #666;
    }
    :deep(.abu-the-words){
        background-image: linear-gradient(90deg, #f00 0%, #fa0 25%, #0a0 50%, #09f 75%, #909 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
</style>