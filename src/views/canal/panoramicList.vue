<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0" @click="gotoPanoramicView">
            <ul>
                <li v-for="item in panoList" :key="item.title" class="pnl-li-item">
                    <img :src="item.thumbPath" :title="item.title" class="wi-f" />
                    <span class="pnl-li-title">{{item.title}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup name="CanalPanoramicList">
    import { useRouter } from "vue-router";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $router = useRouter();
    const panoList = [ //全景图片列表
        {
            thumbPath: "sharepics/qingnian_hinge_1.jpg",
            title: "青年枢纽"
        },
        {
            thumbPath: "sharepics/qingnian_hinge_1.jpg",
            title: "青年枢纽"
        },
        {
            thumbPath: "sharepics/qingnian_hinge_1.jpg",
            title: "青年枢纽"
        },
        {
            thumbPath: "sharepics/qingnian_hinge_1.jpg",
            title: "青年枢纽"
        },
        {
            thumbPath: "sharepics/qingnian_hinge_1.jpg",
            title: "青年枢纽"
        }
    ];
    
    function gotoPanoramicView(){
        $router.push("/panoramicview");
    }
</script>

<style scoped="scoped">
    .pnl-li-item{
        position: relative;
        max-height: 10rem;
        overflow: hidden;
    }
    .pnl-li-title{
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        padding: 0.3rem 0.6rem;
        font-size: 0.6rem;
        color: #fff;
    }
    .pnl-pic-mask1{
        -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%);
    }
    .pnl-pic-mask2{
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%);
    }
</style>