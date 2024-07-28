<template>
    <div class="fx-r fx-wp ps-r" @touchstart="onItemPointerDown" @mousedown="onItemPointerDown">
        <a v-for="item,index in uploadFileList" :key="item.name" class="pud-pic-box" :data-picindex="index" :style="getItemCssStyle(index)">
            <img :src="uploadSrcList[index] || publicAssets.imageImgReading" :alt="item.name" class="wi-f" draggable="false" />
        </a>
        <a v-if="uploadFileList.length < chooseType" class="pud-pic-add" title="添加照片" @click="onChooseFiles(0x9)">
            <input class="dp-hx" 
                title="隐藏着的文件选择器"
                ref="inputFileBox" 
                name="inputFileBox"
                type="file" 
                :accept="chooseType===0x1 ? VIDEO_ACCEPT_TYPE : IMAGE_ACCEPT_TYPE" 
                :multiple="chooseType!==0x1"
                @change="onChooseChange"
            />
        </a>
        <div v-if="dragIndex >= 0" class="pud-pic-box grabbing" :style="dragBoxStyle">
            <img :src="uploadSrcList[dragIndex]" alt="正在拖动的图片" class="wi-f" draggable="false" />
        </div>
    </div>
</template>

<script setup name="PictureUploader">
    import { ref, reactive, computed, defineExpose, getCurrentInstance, onMounted } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const IMAGE_ACCEPT_TYPE = ".JPG,.JPEG,.PNG,.BMP,.GIF"; //可接受的图片类型
    const VIDEO_ACCEPT_TYPE = ".MP4"; //可接受的视频类型
    const PIC_WIDTH_AND_MARGIN = (5.25 * window.pxOf1rem); /* （宽度加上外边距）乘以（1rem有多少像素） */
    
    const $instance = getCurrentInstance();
    const uploadFileList = reactive([]);
    const uploadSrcList = reactive([]);
    const dragTransXY = reactive([0, 0, 0, 0]);//第〇、一索引用来保存当前位置，第二、三索引用来记录初始位置！
    const chooseType = ref(0x9); //0x9 - 图片，0x1 - 视频。（值表示最多可以上传的文件数量！）
    const dragIndex = ref(-1); //当前拖动的图像的索引
    const insertIndex = {value:-1}; //图像插入的位置对应的索引
    const pointerXY = [0, 0];
    const dragBoxStyle = computed(() => ({
        transition: (dragIndex.value >= 0 ? "none" : "transform 300ms"),
        transform: `translate(${dragTransXY[0]}px, ${dragTransXY[1]}px)`
    }));
    const nonRVs = { //非响应式变量（non Responsive Variables）
        numberOfColumns: 3, //每行最多可以放多少张照片
    };
    
    function onItemPointerDown(evt){
        const theElem = (evt.target.hasAttribute("data-picindex") ? evt.target : (evt.target.parentNode.hasAttribute("data-picindex") ? evt.target.parentNode : null));
        if(theElem){
            if(evt.type === "touchstart"){
                if(evt.touches.length !== 1){//多个手指触控时无效
                    return;
                }
                pointerXY[0] = evt.touches[0].clientX;
                pointerXY[1] = evt.touches[0].clientY;
                document.ontouchmove = onItemPointerMove;
                document.ontouchend = onItemPointerUp;
                document.ontouchcancel = onItemPointerUp;
            } else {
                if(evt.button !== 0){//非鼠标左键按下时无效：https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/button
                    return;
                }
                pointerXY[0] = evt.clientX;
                pointerXY[1] = evt.clientY;
                document.onmousemove = onItemPointerMove;
                document.onmouseup = onItemPointerUp;
                document.onmouseleave = onItemPointerUp;
            }
            //第二、三索引用来记录初始位置！
            dragTransXY[2] = dragTransXY[0] = theElem.offsetLeft;
            dragTransXY[3] = dragTransXY[1] = theElem.offsetTop;
            
            dragIndex.value = (+theElem.getAttribute("data-picindex") || 0);
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
            
            const iCol = Math.round(dragTransXY[0] / PIC_WIDTH_AND_MARGIN - 0.1); //第几列，五舍六入
            const iRow = Math.round(dragTransXY[1] / PIC_WIDTH_AND_MARGIN - 0.1); //第几行，五舍六入
            
            insertIndex.value = Math.max(iCol + nonRVs.numberOfColumns * iRow, 0);
            
            console.log(insertIndex.value);
        }
    }
    function onItemPointerUp(evt){
        dragIndex.value = -1;
        insertIndex.value = -1;
        pointerXY[0] = 0;
        pointerXY[1] = 0;
        dragTransXY[2] = dragTransXY[0] = 0;
        dragTransXY[3] = dragTransXY[1] = 0;
        document.onmousemove = null;
        document.onmouseup = null;
        document.onmouseleave = null;
        document.ontouchmove = null;
        document.ontouchend = null;
        document.ontouchcancel = null;
    }
    function onChooseFiles(type){
        chooseType.value = type;
        $instance.refs.inputFileBox.click();
    }
    function onChooseChange(evt){
        //console.log(evt)
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
    function getItemCssStyle(idx){
        const outStyle = {};
        
        if(idx === dragIndex.value){
            outStyle.visibility = "hidden";
        } else if(insertIndex.value >= 0){
            if(idx > dragIndex.value && idx <= insertIndex.value){//非拖到项向左移到
                if(!(idx % nonRVs.numberOfColumns)){//如果是每行的第一项
                    outStyle.transform = `translate(${(nonRVs.numberOfColumns - 1) * PIC_WIDTH_AND_MARGIN}px, ${-PIC_WIDTH_AND_MARGIN}px)`;
                } else {
                    outStyle.transform = `translate(${-PIC_WIDTH_AND_MARGIN}px, 0px)`;
                }
            } else if(idx >= insertIndex.value && idx < dragIndex.value){//非拖到项向右移动
                if(!((idx + 1) % nonRVs.numberOfColumns)){//如果是每行的最后一项
                    outStyle.transform = `translate(${(1 - nonRVs.numberOfColumns) * PIC_WIDTH_AND_MARGIN}px, ${PIC_WIDTH_AND_MARGIN}px)`;
                } else {
                    outStyle.transform = `translate(${PIC_WIDTH_AND_MARGIN}px, 0px)`;
                }
            }
        }
        
        return outStyle;
    }
    
    onMounted(() => {
        nonRVs.numberOfColumns = Math.floor($instance.proxy.$el.clientWidth / PIC_WIDTH_AND_MARGIN);
    });
    
    defineExpose({
        startUpload
    });
</script>

<style>
    .pud-pic-box{
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        width: 5rem; /* 改变这个值同时需要调整 PIC_WIDTH_AND_MARGIN 的值 */
        height: 5rem; /* 高度必须等于宽度！！！ */
        margin: 0 0.25rem 0.25rem 0; /* 改变这个值同时需要调整 PIC_WIDTH_AND_MARGIN 的值 */
        background-color: #eee;
        overflow: hidden;
        transition: transform 300ms;
    }
    .pud-pic-box.grabbing{
        position: absolute;
        left: 0;
        top: 0;
        z-index: 8080;
        margin: 0;
        cursor: grabbing;
        transition: none;
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
        margin-bottom: 0.25rem;
        overflow: hidden;
    }
    .pud-pic-add:active{
        background-color: #e0e0e0;
    }
</style>