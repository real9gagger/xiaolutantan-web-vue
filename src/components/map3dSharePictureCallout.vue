<template>
    <div v-if="isDevShow" class="msp-callout-container" :class="{'devtest': isDevShow}" :style="boxStyle">
        <img class="msp-callout-pic" :src="publicAssets.imageAppLogo" :style="picStyle" />
    </div>
</template>

<script setup name="Map3DSharePictureCallout">
    import { ref, defineProps, computed, defineExpose } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const props = defineProps({
        boxSize: {
            type: Number,
            default: 80
        },
        picSize: {
            type: Number,
            default: 50
        }
    });
    const isDevShow = ref(false); //开发测试时显示用
    const boxStyle = computed(() => {
        //原始图片路径：/public/icons/share_picture_marker.png
        //原始图片的左边距：18像素，上边距：10像素
        //原始图片的圆圈直径（宽高）: 75像素
        //原始图片的宽高：135像素
        
        const sizeRadio = (props.boxSize / 135);
        const paddingLT = (75 * sizeRadio - props.picSize) / 2; //原始图片的圆圈和自定义圆圈左边距（或上边距）
        return {
            width: props.boxSize + "px",
            height: props.boxSize + "px",
            paddingTop: Math.round(10 * sizeRadio + paddingLT) + "px",
            paddingLeft: Math.round(18 * sizeRadio + paddingLT) + "px",
        };
    });
    const picStyle = computed(() => {
        return {
            width: props.picSize + "px",
            height: props.picSize + "px",
        }
    });
    
    function buildCalloutHTML(properties){
        const theDiv = document.createElement("div");
        const theImg = document.createElement("img");
        
        theImg.classList.add("msp-callout-pic");
        theImg.src = properties.pictureList[0].thumbnailPath;
        Object.assign(theImg.style, picStyle.value);
        
        theDiv.classList.add("msp-callout-container");
        theDiv.onanimationend = window.onceAnimationOnly;
        theDiv.appendChild(theImg);
        Object.assign(theDiv.style, boxStyle.value);
        
        return theDiv;
    }
    
    function setCalloutActiviting(elem, isActiviting){
        if(!elem){
            return null;
        }
        
        if(!isActiviting){
            elem.classList.replace("activiting", "visited");
            return null;
        } else {
            elem.classList.add("activiting");
            return elem;
        }
    }
    
    defineExpose({
        buildCalloutHTML,
        setCalloutActiviting
    });
</script>

<style>
    @keyframes msp-callout-bubbling-kf{
        from {
            transform: scale(0);
            opacity: 0.5;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .msp-callout-container{
        display: block;
        overflow: hidden;
        transform-origin: 40.5% 100% 0;
        background-position: 0% 0%;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-image: var(--bg-share-picture-marker);
        animation: msp-callout-bubbling-kf 500ms ease 1;
    }
    .msp-callout-container.activiting{
        background-image: var(--bg-share-picture-activiting);
    }
    .msp-callout-container.visited{
        background-image: var(--bg-share-picture-visited);
    }
    .msp-callout-container.devtest{
        position: fixed;
        top: 200px;
        left: 50vw;
    }
    .msp-callout-pic{
        display: block;
        border-radius: 50%;
        border: 0.1rem solid #fff;
        overflow: hidden;
        background-color: #ccc
    }
</style>