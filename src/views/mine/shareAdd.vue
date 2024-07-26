<template>
    <div class="page-limit-width">
        <div class="content-cage">
            <div class="ps-r mg-b-1rem">
                <textarea class="msa-textarea-box of-no-sb" rows="3" placeholder="说点什么吧~" :maxlength="MAX_TEXT_LENGTH" @input="onTextAreaInput" />
                <span class="msa-input-remaining">{{inputRemainingLength}}</span>
            </div>
            <div class="mg-b-rem5 bd-t-f0"><!-- 分隔线 --></div>
            <div class="fx-r fx-wp">
                <a v-for="item,index in uploadFileList" :key="item.name" class="msa-pic-box">
                    <img :src="uploadSrcList[index]" :alt="item.name" class="wi-f" />
                </a>
                <a v-if="uploadFileList.length < chooseType" class="msa-pic-add" title="添加照片" @click="onChooseFiles(0x9)"></a>
            </div>
            <div class="mg-b-rem5 bd-t-f0"><!-- 分隔线 --></div>
            <div class="fx-hc lh-1x pd-tb-rem5 tp-f0 us-n" @click="gotoAddressPicker">
                <img :src="publicAssets.iconAddShareLocation" class="wh-1rem" />
                <a v-if="!shootingAddress" class="mg-lr-rem25 tc-99 fx-g1">添加照片拍摄位置</a>
                <a v-else class="mg-lr-rem25 tc-66 fx-g1">{{shootingAddress}}</a>
                <img :src="publicAssets.iconArrowRight" style="width:0.8rem;height:0.8rem;opacity:0.6;" />
            </div>
        </div>
        <div class="fixed-limit-width po-br-0 pd-1rem">
            <button class="btn-box" @click="onPublishes">发 布</button>
        </div>
        <div class="dp-hd">
            <input 
                ref="inputFileBox" 
                name="inputFileBox"
                type="file" 
                :accept="chooseType===0x1 ? VIDEO_ACCEPT_TYPE : IMAGE_ACCEPT_TYPE" 
                :multiple="chooseType!==0x1"
                @change="onChooseChange"
            />
        </div>
    </div>
</template>

<script setup name="MineShareAdd">
    import { ref, getCurrentInstance, reactive, computed } from "vue";
    import { useRouter } from "vue-router";
    import { useStore } from "vuex";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const IMAGE_ACCEPT_TYPE = ".JPG,.JPEG,.PNG,.BMP,.GIF"; //可接受的图片类型
    const VIDEO_ACCEPT_TYPE = ".MP4"; //可接受的视频类型
    const MAX_TEXT_LENGTH = 160;
    
    const $instance = getCurrentInstance();
    const $router = useRouter();
    const $store = useStore();
    const chooseType = ref(0x9); //0x9 - 图片，0x1 - 视频。（值表示可以上传的文件数量！）
    const inputRemainingLength = ref(MAX_TEXT_LENGTH);
    const uploadFileList = reactive([]);
    const uploadSrcList = reactive([]);
    const shootingAddress = computed(() => $store.getters.pickPlaceTitle);

    function onChooseFiles(type){
        chooseType.value = type;
        $instance.refs.inputFileBox.click();
    }
    function onChooseChange(evt){
        console.log(evt)
        for(const file of evt.target.files){
            const nth = uploadSrcList.length;
            const reader = new FileReader();
            reader.onload = (arg) => (uploadSrcList[nth] = arg.target.result);
            reader.readAsDataURL(file);
            
            uploadFileList.push({name: file.name});
            uploadSrcList.push(null);
        }
    }
    function gotoAddressPicker(){
        $router.push("/map3dpicker");
    }
    function onTextAreaInput(evt){
        evt.target.style.height = "20px";
        evt.target.style.height = Math.max(Math.min(evt.target.scrollHeight, 288), 72) + "px";
        inputRemainingLength.value = (MAX_TEXT_LENGTH - evt.target.value.length);
    }
    function onPublishes(){
        
    }
</script>

<style scoped="scoped">
    .msa-textarea-box{
        display: block;
        border: 0;
        resize: none;
        padding: 0;
        line-height: 1.5;
    }
    .msa-pic-add{
        display: inline-block;
        width: 5rem;
        height: 5rem;
        background-image: var(--bg-add-share-pictures);
        background-position: 50% 50%;
        background-size: 40% 40%;
        background-repeat: no-repeat;
        background-color: #eee;
        margin-bottom: 0.5rem;
    }
    .msa-pic-add:active{
        background-color: #e0e0e0;
    }
    .msa-pic-box{
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        background-color: #eee;
        position: relative;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        overflow: hidden;
    }
    .msa-input-remaining{
        display: block;
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 1;
        color: #aaa;
        font-size: 0.6rem;
        line-height: 1.0;
    }
</style>