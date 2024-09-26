<template>
    <div class="page-limit-width">
        <div class="content-cage fx-c">
            <textarea v-model="sourceUrl" ref="taBox" class="sui-input-box" rows="5" :placeholder="'请输入照片来源网址\n示例：' + nowUrl" />
            <div class="fx-g1 mg-t-rem5 ps-r">
                <span v-if="errMsg" class="tc-r0 fs-rem6 fx-g1">🙁{{errMsg}}</span>
                <a class="dp-bk tc-b0 fs-rem6 ps-a po-tr-0" @click="onPaste">粘贴</a>
            </div>
            <button type="button" class="btn-box" @click="onDone">完 成</button>
        </div>
    </div>
</template>

<script setup name="MineSourceUrlInputer">
    import { ref, getCurrentInstance } from "vue";
    import { useStore } from "vuex";
    import { useRouter } from "vue-router";
    
    const $instance = getCurrentInstance();
    const $store = useStore();
    const $router = useRouter();
    const sourceUrl = ref($store.getters.pickPictureSourceUrl);
    const errMsg = ref("");
    const urlReg = /^(ftp|http|https)\:\/\/[\w\-]+(\.[\w\-]+)+(\:\d+)*(\/[\w\-]+)*(\.[a-z0-9]+)*$/;
    const nowUrl = location.origin;
    
    let timerID = 0;
    
    function emptyErrMsg(){
        clearTimeout(timerID);
        errMsg.value = null;
        timerID = 0;
    }
    
    function onPaste(){
        try{
            $instance.refs.taBox.focus();
            if(!document.execCommand("paste")){
                appToast("粘贴失败");
            }
        } catch(ex){
            appToast("粘贴出错：" + ex.message);
        }
    }
    
    function onDone(){
        emptyErrMsg();
        
        if(!sourceUrl.value){
            errMsg.value = "请输入网址";
            timerID = setTimeout(emptyErrMsg, 4000);
            return;
        }
        
        let idx = sourceUrl.value.indexOf("?");
        if(idx < 0){
            idx = sourceUrl.value.indexOf("#");
        }
        let path = (idx > 0 ? sourceUrl.value.substr(0, idx) : sourceUrl.value);
        
        if(!urlReg.test(path)){
            errMsg.value = "网址无效";
            timerID = setTimeout(emptyErrMsg, 4000);
            return;
        }
        
        $store.dispatch("setPickPictureSource", { pictureSourceUrl: sourceUrl.value });
        $router.back();
    }
</script>

<style scoped="scoped">
    .sui-input-box{
        display: block;
        border: 0;
        background-color: #eee;
        padding: 0.5rem;
        border-radius: 0.25rem;
        resize: none;
    }
    .sui-input-box::placeholder{
        color: #aaa;
    }
</style>