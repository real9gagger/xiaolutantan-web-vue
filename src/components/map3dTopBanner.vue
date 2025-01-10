<template>
    <div v-if="thumbList.length" class="mtb-container fx-r" @transitionend="onContainerTransitionEnd" :class="{'folding': isFolding}">
        <template v-if="!isMinimize">
            <div class="mtb-z1-bar" :class="{'folding': isFolding, 'ofhd': activedIndex < 0}" @mouseleave="onMakeBigger(-1)" @mousewheel="onNextBigger($event)">
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
                <div class="mtb-board-box">
                    <img
                        v-for="pic in thumbList" alt="黑板报" class="mtb-board-pic"
                        :src="pic.path" 
                        :key="pic.pid"
                        :data-index="pic.pid"
                        :class="{'hiding': pic.pid >= hidingIndex}"
                        @transitionend.stop="onBoardTransitionEnd(pic.pid)" />
                </div>
                <div class="mtb-z3-bar" :class="{'folding': isFolding}">
                    <img alt="滚动图" class="mtb-z3-picbox" :src="thumbList[randomIndex].path" />
                    <img alt="关闭" class="mtb-z3-close" :src="publicAssets.iconCloseXWhite" @click.stop="onCloseBar" />
                </div>
            </div>
        </template>
        <template v-else>
            <img class="mtb-restore-btn" :src="publicAssets.svgTripleFold" @click="onShowBar" />
        </template>
    </div>
</template>

<script setup name="Map3DTopBanner">
    import { onActivated, reactive, ref } from "vue";
    import { needDebounce, needThrottle } from "@/utils/cocohelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const emits = defineEmits(["contentclick"]);
    const thumbList = reactive([]);
    const isFolding = ref(false); //是否正在折叠
    const isMinimize = ref(false); //是否最小化
    const activedIndex = ref(-1);
    const hidingIndex = ref(0x88888888);
    const randomIndex = ref(0);
    
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
    function onNextBigger(evt){
        if(evt.wheelDelta < 0){//下一张图片
            needThrottle(onMakeBigger, 500, Math.max(activedIndex.value - 1, -1));
        } else {//上一张图片
            needThrottle(onMakeBigger, 500, (activedIndex.value < (thumbList.length - 1) ? (activedIndex.value + 1) : 0));
        }
    }
    function onMakeBigger(idx){
        if(activedIndex.value >= 0){
            thumbList[activedIndex.value].css = null;
        } else if(idx < 0){
            return;
        }
        
        activedIndex.value = (activedIndex.value === idx ? -1 : idx);
        if(activedIndex.value >= 0){
            thumbList[activedIndex.value].css = "bigger";
        }
        
        for(let ix = 0; ix < thumbList.length; ix++){
            if(activedIndex.value < 0 || activedIndex.value >= ix){
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
        isFolding.value = true;
    }
    function onShowBar(){
        isMinimize.value = false;
        setTimeout(function(){
            isFolding.value = false;
        }, 50);
    }
    function onContainerTransitionEnd(evt){
        if(evt.target.classList.contains("mtb-container")){
            isMinimize.value = isFolding.value;
        }
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
    .mtb-container{
        position: fixed;
        top: 0.5rem;
        left: max(calc(50vw - var(--container-max-width) / 2), 0.5rem);
        z-index: 9999;
        width: calc(100% - 1rem);
        max-width: var(--container-max-width);
        perspective: 50rem;
        perspective-origin: 50% 50%;
        cursor: pointer;
        opacity: 1;
        transition: all 2s ease 0s;
    }
    .mtb-container.folding{
        opacity: 0.5;
        left: 0.5rem;
    }
    
    .mtb-z1-bar{
        transform-origin: 100% 50%;
        transform: rotateY(0deg);
        transition: transform 2s ease 0s;
        flex: 1 0 33.333333333%;
        height: 2.5rem;
        position: relative;
        background-color: #fff;
        z-index: 0;
        box-shadow: 0 0 1rem 0 #999;
    }
    .mtb-z1-bar.ofhd{
        overflow: hidden;
    }
    .mtb-z1-bar.folding{
        transform: rotateY(-90deg);
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
        transform: rotateY(0deg);
        transition: transform 2s ease 0s;
        flex: 2 0 66.66666666%;
        height: 2.5rem;
        perspective: inherit;
        perspective-origin: inherit;
        position: relative;
        z-index: 8;
    }
    .mtb-z2-bar.folding{
        transform: rotateY(90deg);
    }
    
    .mtb-z3-bar{
        transform-origin: 0% 50%;
        transform: rotateY(0deg);
        transition: transform 2s ease 0s;
        height: 2.5rem;
        flex-basis: 50%;
        background-color: #fff;
        overflow: hidden;
        position: relative;
        z-index: 2;
        border: 0.05rem solid #fff;
        box-shadow: 0 0 1rem 0 #999;
    }
    .mtb-z3-bar.folding{
        transform: rotateY(-180deg);
    }
    .mtb-z3-bar.folding > img{
        opacity:0;
    }
    .mtb-z3-picbox{
        display: block;
        min-height: 2.5rem;
        opacity: 1;
        transition: opacity 500ms ease 500ms;
    }
    .mtb-z3-close{
        position: absolute;
        top: 0.75rem;
        right: 0.5rem;
        z-index: 1;
        width: 1rem;
        height: 1rem;
        transition: opacity 500ms;
        opacity: 1;
    }
    .mtb-z3-close:hover{
        opacity: 0.6;
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
    
    .mtb-board-box{
        height: 2.5rem;
        flex-basis: 50%;
        background-color: #fff;
        overflow: hidden;
        position: relative;
        z-index: 1;
        border-top: 0.05rem solid #fff;
        border-bottom: 0.05rem solid #fff;
        box-shadow: 0 0 1rem 0 #999;
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
    
    .mtb-restore-btn{
        display: inline-block;
        width: 2rem;
        height: 2rem;
        padding: 0.5rem;
        background-color: #fff;
        border-radius: 0.5rem;
        box-shadow: 0 0 0.5rem 0 #999;
    }
</style>