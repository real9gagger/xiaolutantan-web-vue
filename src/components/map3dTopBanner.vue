<template>
    <div v-if="thumbList.length" class="mtb-container fx-r" :class="{'folding': isFolding}">
        <div class="mtb-z1-bar" :class="{'folding': isFolding}" @mouseleave="onMakeBigger(-1)">
            <img 
                v-for="pic in thumbList" alt="缩略图" class="mtb-thumb-pic"
                :src="pic.path" 
                :key="pic.pid" 
                :style="pic.style"
                :class="pic.css"
                @click="onMakeBigger(pic.pid)" />
        </div>
        <div class="mtb-z2-bar" :class="{'folding': isFolding}">
            <div class="mtb-content-box of-lc2" @click="onContentClick"><span class="tc-o1">[新]&nbsp;</span>{{thumbTitle}}</div>
            <div class="mtb-z3-bar hv-f0" :class="{'folding': isFolding}">
                <img :src="publicAssets.iconCloseXGrey" alt="关闭" class="hi-f pd-rem5 bd-l-f0" />
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
    const thumbTitle = ref("");
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
        
        thumbTitle.value = data[0].title;
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
    
    defineExpose({
        initiData
    });
</script>

<style>    
    @keyframes mtb-z1-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        50% {
            transform: rotateY(-90deg);
        }
        100% {
            transform: rotateY(-90deg);
        }
    }
    @keyframes mtb-z2-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        50% {
            transform: rotateY(90deg);
        }
        75% {
            transform: rotateY(0deg) scaleX(1);
        }
        100% {
            transform: rotateY(0deg) scaleX(2);
        }
    }
    @keyframes mtb-z3-fold-kf{
        0% {
            transform: rotateY(0deg);
        }
        50% {
            transform: rotateY(-180deg);
        }
        100% {
            transform: rotateY(-180deg);
        }
    }
    
    .mtb-container{
        position: fixed;
        top: 0.5rem;
        z-index: 8888;
        max-width: var(--container-max-width);
        width: calc(100% - 1rem);
        left: max(calc(50vw - var(--container-max-width) / 2), 0.5rem);
        perspective: 50rem;
        perspective-origin: 50% 50%;
        cursor: pointer;
        box-shadow: 0 0 0.5rem 0 #999;
    }
    .mtb-container.folding{
        box-shadow: none;
    }
    .mtb-z1-bar{
        transform-origin: 100% 50%;
        flex: 1;
        height: 2rem;
        position: relative;
        background-color: #fff;
    }
    .mtb-z1-bar.folding{
        overflow: hidden;
        animation: mtb-z1-fold-kf 6s ease infinite 0s alternate;
    }
    .mtb-z2-bar{
        display: flex;
        flex-direction: row;
        transform-origin: 0% 50%;
        flex: 2;
        height: 2rem;
        perspective: inherit;
        perspective-origin: inherit;
        position: relative;
        z-index: 88;
    }
    .mtb-z2-bar.folding{
        overflow: hidden;
        animation: mtb-z2-fold-kf 6s ease infinite 0s alternate;
    }
    .mtb-z3-bar{
        transform-origin: 0% 50%;
        height: 2rem;
        width: 2rem;
        background-color: #09f;
    }
    .mtb-z3-bar.folding{
        flex: 1;
        overflow: hidden;
        animation: mtb-z3-fold-kf 6s ease infinite 0s alternate;
    }
    .mtb-content-box{
        height: 2rem;
        flex: 1;
        background-color: #fff;
        font-size: 0.7rem;
        line-height: 1rem;
        padding: 0 0.2rem;
    }
    .mtb-thumb-pic{
        position: absolute;
        top: 0;
        width: 2rem;
        height: 2rem;
        border: 0.05rem solid #fff;
        transition: transform 300ms, left 300ms;
        transform-origin: 0% 0%;
        transform: translate(0, 0) scale(1);
        object-fit: cover;
    }
    .mtb-thumb-pic:hover{
        border-color: var(--main-color);
    }
    .mtb-thumb-pic.bigger{
        box-shadow: 0 0 0.5rem 0 #999;
        transform: translate(100%, 150%) scale(3);
    }
</style>