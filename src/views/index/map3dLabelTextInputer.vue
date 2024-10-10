<template>
    <div class="page-limit-width">
        <div class="content-cage fx-c">
            <div class="ps-r">
                <input 
                    v-model="newText" 
                    :maxlength="limitLength" 
                    @input="onInput" 
                    @keyup.enter="onConfirm"
                    ref="inputBoxRef"
                    type="text" 
                    class="lti-input-box" 
                    placeholder="请输入内容" />
                <span class="lti-input-remaining">{{remainingLength}}</span>
            </div>
            <div class="fx-g1 fs-rem6 tc-99 mg-tb-rem2">按 Enter 键完成输入</div>
            <button type="button" class="btn-box" @click="onConfirm">完 成</button>
        </div>
    </div>
</template>

<script setup name="IndexMap3DLabelTextInputer">
    import { ref, onMounted, onUnmounted, nextTick } from "vue";
    import { useRouter, useRoute } from "vue-router";
    import { getPageTempData, setPageTempData } from "@/utils/pagehelper.js";
    
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
            setTimeout(() => inputBoxRef.value.focus(), 50); //自动聚焦
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
    
    onMounted(() => {
        const lb = getPageTempData();
        if(lb && $route.query.lbid == lb._config.labelID){
            newText.value = oldText.value = lb.domElement.innerText;
            remainingLength.value -= newText.value.length;
        }
        nextTick(() => inputBoxRef.value.focus());
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
    .lti-input-remaining{
        display: block;
        position: absolute;
        bottom: 0.2rem;
        right: 0.2rem;
        z-index: 1;
        color: #d00;
        font-size: 0.6rem;
        line-height: 1.0;
    }
</style>