<template>
    <div class="fx-r fx-wp ps-r" 
        @touchstart="onItemPointerDown"
        @mousedown="onItemPointerDown"
        @mousemove="onItemPointerMove"
        @mouseup="onItemPointerUp">
        <a v-for="item,index in uploadFileList" :key="item.name" class="pud-pic-box" :class="{'op-0': dragIndex===index}">
            <img :src="uploadSrcList[index]" :alt="item.name" :data-picindex="index" class="wi-f" draggable="false" />
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
        <div v-if="dragIndex >= 0" class="pud-pic-box pud-grabbing-box" :style="dragBoxStyle">
            <img :src="uploadSrcList[dragIndex]" alt="正在拖动的图片" class="wi-f" draggable="false" />
        </div>
    </div>
</template>

<script setup name="PictureUploader">
    import { ref, reactive, computed, defineExpose, getCurrentInstance } from "vue";
    
    const IMAGE_ACCEPT_TYPE = ".JPG,.JPEG,.PNG,.BMP,.GIF"; //可接受的图片类型
    const VIDEO_ACCEPT_TYPE = ".MP4"; //可接受的视频类型
    
    const $instance = getCurrentInstance();
    const uploadFileList = reactive([]);
    const uploadSrcList = reactive([]);
    const dragTransXY = reactive([0, 0]);
    const chooseType = ref(0x9); //0x9 - 图片，0x1 - 视频。（值表示最多可以上传的文件数量！）
    const dragIndex = ref(-1); //当前拖动的图像的索引
    const pointerXY = [0, 0];
    const dragBoxStyle = computed(() => ({
        transform: `translate(${dragTransXY[0]}px, ${dragTransXY[1]}px)`
    }));
    
    function onItemPointerDown(evt){
        const picIndex = evt.target.getAttribute("data-picindex");
        console.log(evt, picIndex)
        if(/^\d+$/.test(picIndex)){
            if(evt.type === "touchstart"){
                if(evt.touches.length !== 1){//多个手指触控时无效
                    return;
                }
                pointerXY[0] = evt.touches[0].clientX;
                pointerXY[1] = evt.touches[0].clientY;
            } else {
                if(evt.button !== 0){//非鼠标左键按下时无效：https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/button
                    return;
                }
                pointerXY[0] = evt.clientX;
                pointerXY[1] = evt.clientY;
            }
            dragIndex.value = (+picIndex || 0);
            dragTransXY[0] = evt.target.parentNode.offsetLeft;
            dragTransXY[1] = evt.target.parentNode.offsetTop;
        }
    }
    function onItemPointerMove(evt){
        if(dragIndex.value >= 0){
            const isTm = (evt.type === "touchmove");
            const cXY = [(isTm ? evt.touches[0].clientX : evt.clientX), (isTm ? evt.touches[0].clientY : evt.clientY)];
            
            dragTransXY[0] += (cXY[0] - pointerXY[0]);
            dragTransXY[1] += (cXY[1] - pointerXY[1]);
            
            pointerXY[0] = cXY[0];
            pointerXY[1] = cXY[1];
        }
    }
    function onItemPointerUp(evt){
        dragIndex.value = -1;
        pointerXY[0] = 0;
        pointerXY[1] = 0;
    }
    
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
    .pud-grabbing-box{
        position: absolute;
        left: 0;
        top: 0;
        z-index: 88;
        cursor: grab;
    }
    .pud-pic-box{
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        background-color: #eee;
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