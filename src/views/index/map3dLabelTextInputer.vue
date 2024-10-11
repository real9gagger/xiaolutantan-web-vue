<template>
    <div class="page-limit-width">
        <div class="content-cage fx-c">
            <div class="ps-r zi-1">
                <input 
                    v-model="newText" 
                    :maxlength="limitLength" 
                    @input="onInput" 
                    @keyup.enter="onConfirm"
                    ref="inputBoxRef"
                    type="text" 
                    class="lti-input-box" 
                    placeholder="请输入内容" />
                <img class="lti-input-clear" :src="publicAssets.imageMarkerCloseBtn" @click="onClear" alt="清空" title="清空内容" />
                <span class="lti-input-remaining">{{remainingLength}}</span>
                <span class="lti-input-arrow"></span>
            </div>
            <div class="ps-r zi-1 mg-tb-rem5 fx-hc pd-l-1rem">
                <img :src="publicAssets.imageMarkerFlagRed" alt="标记图标" />
                <span class="fx-g1 fs-rem6 ta-r tc-99">按回车键完成输入</span>
            </div>
            <div class="fx-g1"><!-- 占位用 --></div>
            <button type="button" class="btn-box ps-r zi-1" @click="onConfirm">完 成</button>
            <img :src="publicAssets.imageMarkerBaseMap" class="lti-base-pic" alt="标记底图" />
        </div>
    </div>
</template>

<script setup name="IndexMap3DLabelTextInputer">
    import { ref, onMounted, onUnmounted, nextTick } from "vue";
    import { useRouter, useRoute } from "vue-router";
    import { getPageTempData, setPageTempData } from "@/utils/pagehelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $router = useRouter();
    const $route = useRoute();
    const limitLength = 20;
    const newText = ref("");
    const oldText = ref("");
    const inputBoxRef = ref(null);
    const remainingLength = ref(limitLength);
    
    function onConfirm(){
        const tempTxt = newText.value.trim();
        
        if(!tempTxt){
            setTimeout(inputAutoFocus, 50); //自动聚焦
            return !appToast("请输入内容");
        }
        
        if(oldText.value !== tempTxt){
            const lb = getPageTempData();
            if(lb){
                lb.setContent(lb.content.replace(oldText.value, tempTxt));
            }
        }
        
        $router.back();
    }
    
    function onInput(evt){
        remainingLength.value = (limitLength - evt.target.value.length);
    }
    
    function onClear(){
        newText.value = "";
        setTimeout(inputAutoFocus, 50); //自动聚焦
    }
    
    function inputAutoFocus(){
        inputBoxRef.value.focus();
    }
    
    onMounted(() => {
        const lb = getPageTempData();
        if(lb && $route.query.lbid == lb._config.labelID){
            newText.value = oldText.value = lb.domElement.innerText;
            remainingLength.value -= newText.value.length;
        }
        nextTick(inputAutoFocus);
    });
    
    onUnmounted(() => {
        setPageTempData(null);
    });
</script>

<style scoped="scoped">
    .lti-input-box{
        display: block;
        border: 0.05rem solid #f00;
        background-color: #fffdec;
        line-height: 2.5rem;
        padding: 0 0.5rem;
    }
    .lti-input-clear{
        display: block;
        width: 0.8rem;
        height: 0.8rem;
        position: absolute;
        top: calc(50% - 0.4rem);
        right: 0.8rem;
        z-index: 3;
        cursor: pointer;
    }
    .lti-input-remaining{
        display: block;
        position: absolute;
        bottom: 0.2rem;
        right: 0.2rem;
        z-index: 1;
        color: #999;
        font-size: 0.6rem;
        line-height: 1.0;
    }
    .lti-input-arrow{
        display: block;
        width: 0.6rem;
        height: 0.6rem;
        position: absolute;
        bottom: -0.3rem;
        left: 1.2rem;
        z-index: 8;
        background-color: #fffdec;
        border-right: 0.05rem solid #f00;
        border-bottom: 0.05rem solid #f00;
        transform: rotateZ(45deg);
    }
    .lti-base-pic{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: 25rem;
        height: auto;
        max-width: 100%;
        mask-image: radial-gradient(circle farthest-side at 0% 0%, #000 0%, transparent 100%);
    }
</style>