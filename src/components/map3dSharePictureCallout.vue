<template>
    <div v-if="isDevShow" class="msp-callout-container" :class="{'devtest': isDevShow}" :style="boxStyle">
        <img class="msp-callout-pic" :src="publicAssets.imagePictureForShare" :style="picStyle" alt="缩略图" />
        <img class="msp-play-video" :src="publicAssets.iconPlayVideo" :style="playStyle" alt="播放视频" />
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
        const offset = calcLeftAndTop(0);
        return {
            width: props.boxSize + "px",
            height: props.boxSize + "px",
            paddingTop: offset.top + "px",
            paddingLeft: offset.left + "px",
        };
    });
    const picStyle = computed(() => {
        return {
            width: props.picSize + "px",
            height: props.picSize + "px",
        }
    });
    const playStyle = computed(() => {
        const delta = 0; //Math.round(0.1 * window.pxOf1rem); //约等于分享的照片的边框大小
        const offset = calcLeftAndTop(delta);
        const boxWidth = props.picSize - 2 * delta;
        
        return {
            left: offset.left + "px",
            top: offset.top + "px",
            width: boxWidth + "px",
            height: boxWidth + "px",
        };
    });
    
    function calcLeftAndTop(delta){
        //原始图片路径：/public/icons/share_picture_marker.png
        //原始图片的左边距：18像素，上边距：10像素
        //原始图片的圆圈直径（宽高）: 75像素
        //原始图片的宽高：135像素
        
        const sizeRadio = (props.boxSize / 135);
        const paddingLT = (75 * sizeRadio - props.picSize) / 2; //原始图片的圆圈和自定义圆圈左边距（或上边距）
        return {
            left: Math.round(18 * sizeRadio + paddingLT + delta),
            top: Math.round(10 * sizeRadio + paddingLT + delta)
        };
    }
    
    function buildCalloutHTML(properties){
        const theDiv = document.createElement("div");
        const theImg = document.createElement("img");
        
        theImg.classList.add("msp-callout-pic");
        theImg.src = properties.pictureList[0].thumbnailPath;
        theImg.alt = "缩略图";
        Object.assign(theImg.style, picStyle.value);
        
        theDiv.classList.add("msp-callout-container");
        theDiv.onanimationend = window.onceAnimationOnly;
        theDiv.appendChild(theImg);
        Object.assign(theDiv.style, boxStyle.value);
        
        //如果是视频内容
        if(properties.isVideo){
            const thePlayIcon = document.createElement("img");
            thePlayIcon.classList.add("msp-play-video");
            thePlayIcon.src = publicAssets.iconPlayVideo;
            thePlayIcon.alt = "播放视频";
            Object.assign(thePlayIcon.style, playStyle.value);
            theDiv.appendChild(thePlayIcon);
        }
        
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
        top: 10rem;
        left: 50vw;
        z-index: 100;
    }
    .msp-callout-pic{
        display: block;
        border-radius: 50%;
        border: 0.1rem solid #fff;
        overflow: hidden;
        background-color: #ccc;
        object-fit: cover;
    }
    .msp-play-video{
        display: block;
        position: absolute;
        z-index: 1;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        opacity: 0.68;
    }
</style>