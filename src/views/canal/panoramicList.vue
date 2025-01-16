<template>
    <div class="page-limit-width" @click="clearCurrentIndex">
        <div class="content-cage" style="padding:0.2rem 0 0 0.2rem">
            <ul class="fx-r fx-wp">
                <li v-for="item,index in panoList" class="pnl-li-item" 
                :key="item.id" 
                :class="{'actived': currentIndex===index}" 
                @click.stop="gotoPanoramicView(index)">
                    <img v-for="pic,nth in item.thumbPaths" :key="nth" :src="pic" :alt="item.title" :class="{'pnl-li-thumbs': nth > 0}" :style="getThumbStyle(nth)" />
                    <span v-if="item.thumbPaths.length > 1" class="pnl-pic-count" :style="getThumbStyle(item.thumbPaths.length)">+{{item.thumbPaths.length - 1}}</span>
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
    
    function getThumbStyle(nth){
        if(!nth){
            return "width:100%";
        }
        
        const offset = nth * 0.1;
        
        return `transform:translate(-${offset}rem,${offset}rem)`;
    }
</script>

<style scoped="scoped">
    .pnl-li-item{
        position: relative;
        max-height: 10rem;
        overflow: hidden;
        cursor: pointer;
        padding-right: 0.2rem;
        margin-bottom: 0.2rem;
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
    .pnl-li-thumbs{
        display:block;
        position:absolute;
        top:0.25rem;
        right:0.4rem;
        z-index:8;
        width:1.5rem;
        height:1.5rem;
        border:0.05rem solid #fff;
    }
    .pnl-pic-count{
        display:block;
        position:absolute;
        top:1.7rem;
        right:0.3rem;
        min-width:1.5rem;
        color:#fff;
        font-size:0.6rem;
        text-align:center;
        z-index:8;
        opacity:0.6;
    }
</style>