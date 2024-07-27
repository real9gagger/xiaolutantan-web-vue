<template>
    <div class="fx-r fx-wp">
        <a v-for="item,index in uploadFileList" :key="item.name" class="pud-pic-box">
            <img :src="uploadSrcList[index]" :alt="item.name" class="wi-f" draggable="false" />
        </a>
        <a v-if="uploadFileList.length < chooseType" class="pud-pic-add" title="添加照片" @click="onChooseFiles(0x9)"></a>
        <div class="ps-a po-tl-0 dp-hx" title="隐藏着的文件选择器">
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

<script setup name="PictureUploader">
    import { ref, reactive, defineExpose, getCurrentInstance } from "vue";
    
    const IMAGE_ACCEPT_TYPE = ".JPG,.JPEG,.PNG,.BMP,.GIF"; //可接受的图片类型
    const VIDEO_ACCEPT_TYPE = ".MP4"; //可接受的视频类型
    
    const $instance = getCurrentInstance();
    const uploadFileList = reactive([]);
    const uploadSrcList = reactive([]);
    const chooseType = ref(0x9); //0x9 - 图片，0x1 - 视频。（值表示最多可以上传的文件数量！）
    
    function onChooseFiles(type){
        chooseType.value = type;
        $instance.refs.inputFileBox.click();
    }
    function onChooseChange(evt){
        console.log(evt)
        for(const file of evt.target.files){
            const nth = uploadSrcList.length;
            if((nth + 1) > chooseType.value){
                break;
            }
            const reader = new FileReader();
            reader.onload = (arg) => (uploadSrcList[nth] = arg.target.result);
            reader.readAsDataURL(file);
            
            uploadFileList.push({name: file.name});
            uploadSrcList.push(null);
        }
    }
    function startUpload(){
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }
    
    defineExpose({
        startUpload
    });
</script>

<style>
    .pud-pic-box{
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
    .pud-pic-add{
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
    .pud-pic-add:active{
        background-color: #e0e0e0;
    }
</style>