<template>
    <div class="page-limit-width" @click="clearCurrentIndex">
        <div class="content-cage" style="padding:0.15rem 0 0 0.15rem">
            <ul class="fx-r fx-wp">
                <li v-for="item,index in panoList" class="pnl-li-item" 
                :key="item.id" 
                :class="{'actived': currentIndex===index}" 
                @click.stop="gotoPanoramicView(index)">
                    <img :src="item.thumbPath" :alt="item.title" class="wi-f" />
                    <span class="pnl-li-title">{{item.title}} • {{item.captureTime}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup name="CanalPanoramicList">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import { panoList } from "@/assets/data/constants.js";
    
    const $router = useRouter();
    const currentIndex = ref(-1);
    
    function gotoPanoramicView(idx){
        currentIndex.value = idx;
        $router.push("/panoramicview?id=" + panoList[idx].id);
    }
    
    function clearCurrentIndex(){
        currentIndex.value = -1;
    }
</script>

<style scoped="scoped">
    .pnl-li-item{
        position: relative;
        max-height: 10rem;
        overflow: hidden;
        cursor: pointer;
        padding-right: 0.15rem;
        margin-bottom: 0.15rem;
        flex-basis: 50%;
    }
    .pnl-li-item:active{
        opacity: 0.75;
    }
    .pnl-li-item.actived::after{
        content: "";
        display: block;
        position: absolute;
        inset: 0 0.15rem 0 0;
        z-index: 1;
        border: 0.1rem solid #f56c6c;
    }
    .pnl-li-title{
        display: block;
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 1;
        padding: 0.2rem 0.4rem;
        font-size: 0.6rem;
        color: #fff;
    }
    /* .pnl-pic-mask1{
        -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%);
    }
    .pnl-pic-mask2{
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%);
    } */
</style>