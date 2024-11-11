<template>
    <div v-if="thumbList.length && isShow" class="mtb-container fx-r" @animationend="onContainerAnimationEnd" :class="{'folding': isFolding}">
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
        <div class="mtb-z2-bar" :class="{'folding': isFolding}" @click="onContentClick">
            <div class="mtb-content-box">
                <img
                    v-for="pic in thumbList" alt="黑板报" class="mtb-board-pic"
                    :src="pic.path" 
                    :key="pic.pid"
                    :data-index="pic.pid"
                    :class="{'hiding': pic.pid >= hidingIndex}"
                    @transitionend="onBoardTransitionEnd(pic.pid)" />
            </div>
            <div class="mtb-z3-bar" :class="{'folding': isFolding}">
                <img alt="滚动图" class="dp-bk" :src="thumbList[randomIndex].path" />
                <p class="mtb-z3-mask"><!-- 遮罩层 --></p>
                <img alt="关闭" :src="publicAssets.iconCloseXGrey" @click.stop="onCloseBar" class="wh-1rem ps-a po-t-c hv-op6" style="right:0.5rem" />
            </div>
        </div>
    </div>
</template>

<script setup name="Map3DTopBanner">
    import { onActivated, reactive, ref } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const emits = defineEmits(["contentclick"]);
    const activedPicIndex = ref(-1);
    const isFolding = ref(false); //是否正在折叠
    const hidingIndex = ref(0x88888888);
    const thumbList = reactive([]);
    const randomIndex = ref(0);
    const isShow = ref(true);
    
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
        randomIndex.value = Math.round(Math.random() * thumbList.length);
        setTimeout(onBoardTransitionEnd, 1000, 0);
    }
    function onContentClick(evt){
        emits("contentclick", evt);
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
    function onBoardTransitionEnd(idx){
        if(hidingIndex.value >= thumbList.length){
            needDebounce(restartBoardTransition, 1000);
        } else {
            if(idx > 1){
                hidingIndex.value = (idx - 1);
            } else {
                hidingIndex.value = (0x88888888);
            }
        }
    }
    function restartBoardTransition(){
        hidingIndex.value = (thumbList.length - 1);
    }
    
    function onCloseBar(){
        isFolding.value = !isFolding.value;
    }
    
    
    function onContainerAnimationEnd(){
        isShow.value = false;
    }
    
    onActivated(() => {
        if(thumbList.length){
            randomIndex.value = Math.round(Math.random() * thumbList.length);
            setTimeout(onBoardTransitionEnd, 1000, hidingIndex.value);
        }
    });
    
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
        z-index: 0;
    }
    .mtb-z1-bar.folding{
        overflow: hidden;
        animation: mtb-z1-fold-kf 2s ease 1 0s alternate;
    }
    .mtb-z1-bar::after{
        content: "";
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 4444;
        border-left: 0.05rem solid #fff;
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
        z-index: 8;
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
        position: relative;
        z-index: 2;
    }
    .mtb-z3-bar.folding{
        animation: mtb-z3-fold-kf 2s ease 1 0s alternate;
    }
    .mtb-z3-bar.folding > .mtb-z3-mask{background-color:rgba(255, 255, 255, 1)}
    .mtb-z3-mask{
        position: absolute;
        inset: 0;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0);
        transition: background-color 500ms ease 500ms;
    }
    
    .mtb-content-box{
        height: 2.5rem;
        flex-basis: 50%;
        background-color: #fff;
        overflow: hidden;
        position: relative;
        z-index: 1;
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
    
    .mtb-board-pic{
        display: block;
        width: 100%;
        min-height: 2.5rem;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        transition: transform 5s ease 5s;
        transform: translateY(0);
    }
    .mtb-board-pic.hiding{
        transform: translateY(-100%);
    }
</style>