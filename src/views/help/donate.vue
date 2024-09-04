<template>
    <div class="page-limit-width">
        <div class="content-cage ta-c dnt-bg-box">
            <div class="dnt-bg-mask"></div>
            <div class="ps-a po-f of-a pd-tb-2rem">
                <h4 class="fs-1rem tc-ff">“{{donateWords}}”</h4>
                
                <p class="mg-t-2rem mg-b-rem5 fw-b">通过微信捐款 ▼</p>
                <img :src="publicAssets.imageDonateByWechatpay" alt="通过微信捐款" class="dnt-pic-box" onerror="onImageLoadingError()" />
                
                <p class="mg-t-2rem mg-b-rem5 fw-b">通过支付宝捐款 ▼</p>
                <img :src="publicAssets.imageDonateByAlipay" alt="通过支付宝捐款" class="dnt-pic-box" onerror="onImageLoadingError()" />
                
                <p class="mg-t-2rem tc-66">如需退款请联系 {{contactEmail}}</p>
            </div>
        </div>
    </div>
</template>

<script setup name="HelpDonate">
    import { donateWords, contactEmail } from "@/assets/data/constants.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
</script>

<style scoped="scoped">
    .dnt-bg-box{
        background-image: var(--bg-about-us-bg);
        background-position: 0% 0%;
        background-size: 100% auto;
        background-repeat: repeat;
    }
    .dnt-bg-mask{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(1rem);
    }
    .dnt-pic-box{
        display: block;
        margin: 0 auto;
        width: min(15rem, 500px);
        height: auto;
    }
</style>