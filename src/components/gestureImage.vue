<template>
    <img 
        :alt="alt" 
        :src="src"
        @touchstart="onImgTouchStart"
        @touchmove="onImgTouchMove"
        @touchend="onImgTouchEnd"
        @touchcancel="onImgTouchCancel"
        @mousedown="onImgMouseDown"
        @mousemove="onImgMouseMove"
        @mouseup="onImgMouseUp"
        @mousewheel="onImgMouseWheel"
        class="wi-f"
    />
</template>

<script setup name="GestureImage">
    import { ref, defineProps } from "vue";
    const props = defineProps({
        alt: {
            type: String,
            default: ""
        },
        src: {
            type: String,
            default: ""
        }
    });
    
    function onImgTouchStart(evt){
        console.log(evt);
    }
    function onImgTouchMove(evt){
        console.log(evt);
    }
    function onImgTouchEnd(evt){
        console.log(evt);
    }
    function onImgTouchCancel(evt){
        console.log(evt);
    }
    function onImgMouseDown(evt){
        console.log(evt);
    }
    function onImgMouseMove(evt){
        console.log(evt);
    }
    function onImgMouseUp(evt){
        console.log(evt);
    }
    function onImgMouseWheel(evt){
        console.log(evt);
    }
</script>

<style>
</style>