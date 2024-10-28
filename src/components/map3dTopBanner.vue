<template>
    <div v-if="thumbList.length" class="mtb-container fx-r" :class="{'folding': isFolding}">
        <div class="mtb-z1-bar" :class="{'folding': isFolding}" @mouseleave="onMakeBigger(-1)">
            <p class="ps-a po-tl-0 pd-l-rem2 zi-x1 fs-rem6 tc-p0">[新]</p>
            <img 
                v-for="pic in thumbList" alt="缩略图" class="mtb-thumb-pic"
                :src="pic.path" 
                :key="pic.pid" 
                :style="pic.style"
                :class="pic.css"
                @click="onMakeBigger(pic.pid)" />
        </div>
        <div class="mtb-z2-bar" :class="{'folding': isFolding}">
            <div class="mtb-content-box" @click="onContentClick">
                <img
                    v-for="pic in thumbList" alt="黑板报" class="mtb-board-pic"
                    :src="pic.path" 
                    :key="pic.pid"
                    :data-index="pic.pid"
                    :class="{'hiding': (pic.pid + 1) === thumbList.length}"
                    @animationend="onBoardAnimationEnd" />
            </div>
            <div class="mtb-z3-bar" :class="{'folding': isFolding}">
                <img :src="thumbList[0].path" alt="关闭" class="mtb-moving-pic" />
            </div>
        </div>
    </div>
</template>

<script setup name="Map3DTopBanner">
    import { computed, reactive, ref } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const emits = defineEmits(["contentclick"]);
    const activedPicIndex = ref(-1);
    const isFolding = ref(false); //是否正在折叠
    const thumbList = reactive([]);
    
    function initiData(data){
        if(!data || !data.length){
            return;
        }
        
        //按 ID 从大到小排序
        data.sort((v1, v2) => (v2.id - v1.id));
        
        let limit = 20;
        let index = 0;
        for(const item of data){
            for(const pic of item.pictureList){
                thumbList.push({
                    pid: index,
                    path: pic.thumbnailPath,
                    style: {
                        zIndex: (limit - index),
                        left: (index * 0.5) + "rem"
                    },
                    css: null
                });
                if(++index >= limit){
                    break;
                }
            }
            if(index >= limit){
                break;
            }
        }
    }
    function onContentClick(evt){
        //for(let ix = 0; ix < thumbList.length; ix++){
            //thumbList[ix].style.transform = `translate(${20-ix}rem,${20-ix}rem) scale(${(20-ix)*0.5})`;
        //}
        isFolding.value = !isFolding.value;
        //emits("contentclick", evt);
    }
    function onMakeBigger(idx){
        if(activedPicIndex.value >= 0){
            thumbList[activedPicIndex.value].css = null;
        } else if(idx < 0){
            return;
        }
        
        activedPicIndex.value = (activedPicIndex.value === idx ? -1 : idx);
        if(activedPicIndex.value >= 0){
            thumbList[activedPicIndex.value].css = "bigger";
        }
        
        for(let ix = 0; ix < thumbList.length; ix++){
            if(activedPicIndex.value < 0 || activedPicIndex.value >= ix){
                thumbList[ix].style.left = (ix * 0.5) + "rem";
            } else {
                thumbList[ix].style.left = (ix * 0.5 - 0.5) + "rem";
            }
        }
    }
    function onBoardAnimationEnd(evt){
        const $elem = $(evt.target);
        if($elem.data("index") > 0){
            $elem.prev().addClass("hiding");
        } else {
            $elem.siblings().addBack().removeClass("hiding");
            setTimeout(() => $elem.siblings().last().addClass("hiding"), 100);
        }
    }
    
    defineExpose({
        initiData
    });
</script>

<style>    
    @keyframes mtb-z1-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        100% {
            transform: rotateY(-90deg);
        }
    }
    @keyframes mtb-z2-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        100% {
            transform: rotateY(90deg);
        }
    }
    @keyframes mtb-z3-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        100% {
            transform: rotateY(-180deg);
        }
    }
    @keyframes mtb-moving-pic-kf{
        from{
            transform: translateY(0%);
        }
        to {
            transform: translateY(calc(2.5rem - 100%));
        }
    }
    @keyframes mtb-board-pic-kf{
        from{
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .mtb-container{
        position: fixed;
        top: 0.5rem;
        left: max(calc(50vw - var(--container-max-width) / 2), 0.5rem);
        z-index: 8888;
        width: calc(100% - 1rem);
        max-width: var(--container-max-width);
        perspective: 50rem;
        perspective-origin: 50% 50%;
        cursor: pointer;
        transition: box-shadow 300ms;
        box-shadow: 0 0 0.5rem 0 #999;
    }
    .mtb-container.folding{
        box-shadow: 0 0 0.5rem 0 transparent;
    }
    
    .mtb-z1-bar{
        transform-origin: 100% 50%;
        flex: 1;
        height: 2.5rem;
        position: relative;
        background-color: #fff;
    }
    .mtb-z1-bar.folding{
        overflow: hidden;
        animation: mtb-z1-fold-kf 2s ease 1 0s alternate;
    }
    
    .mtb-z2-bar{
        display: flex;
        flex-direction: row;
        transform-origin: 0% 50%;
        flex: 2;
        height: 2.5rem;
        perspective: inherit;
        perspective-origin: inherit;
        position: relative;
        z-index: 88;
        overflow: hidden;
    }
    .mtb-z2-bar.folding{
        animation: mtb-z2-fold-kf 2s ease 1 0s alternate;
    }
    
    .mtb-z3-bar{
        transform-origin: 0% 50%;
        height: 2.5rem;
        flex-basis: 50%;
        background-color: #fff;
        overflow: hidden;
    }
    .mtb-z3-bar.folding{
        animation: mtb-z3-fold-kf 2s ease 1 0s alternate;
    }
    
    .mtb-content-box{
        height: 2.5rem;
        flex-basis: 50%;
        background-color: #fff;
        overflow: hidden;
        position: relative;
    }
    
    .mtb-thumb-pic{
        position: absolute;
        top: 0;
        width: 2.5rem;
        height: 2.5rem;
        border: 0.05rem solid #fff;
        transition: all 300ms;
        transform-origin: 0% 0%;
        transform: translate(0, 0) scale(1);
        box-shadow: none;
        object-fit: cover;
    }
    .mtb-thumb-pic:hover{
        border-color: var(--main-color);
    }
    .mtb-thumb-pic.bigger{
        box-shadow: 0 0 0.5rem 0 #999;
        transform: translate(100%, 150%) scale(3);
    }
    
    .mtb-moving-pic{
        width: 100%;
        animation: mtb-moving-pic-kf 10s ease infinite 0s alternate;
    }
    
    .mtb-board-pic{
        display: block;
        width: 100%;
        min-height: 2.5rem;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
    }
    .mtb-board-pic.hiding{
        animation: mtb-board-pic-kf 10s ease 1 0s normal forwards;
    }
</style>