<template>
    <div v-if="isShowing" class="miw-box-container" :class="{'showup': isAnimating}">
        <img class="miw-icon-box" :src="publicAssets.iconCurrentPositionCity" />
        <span class="miw-text-box">{{title}}</span>
        <img class="miw-icon-box" @click="onPinBtnTap" :src="publicAssets.iconMapPinFill" />
    </div>
</template>

<script setup name="Map3DInfoWindow">
    import { ref, watch, defineProps } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const props = defineProps({
        lnglats: {
            type: Array,
            default: () => []
        },
        title: {
            type: String,
            default: ""
        }
    });
    
    const isShowing = ref(false);
    const isAnimating = ref(false);
    const emits = defineEmits(["placepins"]);
    
    watch(() => props.lnglats, function(newVal){
        if(newVal && newVal.length){
            if(!isShowing.value){
                isShowing.value = true;
                setTimeout(startBubbling, 50);
            }
        } else {
            if(isShowing.value){
                resetBubbling();
                setTimeout(closeMe, 350);
            }
        }
    });
    
    function closeMe(){
        isShowing.value = false;
        isAnimating.value = false;
    }
    
    //启动冒气泡的动画
    function startBubbling(){
        isAnimating.value = true;
    }
    
    //重置冒气泡的动画
    function resetBubbling(){
        isAnimating.value = false;
    }
    
    function onPinBtnTap(){
        emits("placepins", props.lnglats);
    }
</script>

<style>
    .miw-box-container{
        display: flex;
        flex-direction: row;
        align-items: center;
        position: fixed;
        bottom: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
        z-index: 8899;
        background-color: #fff;
        box-shadow: 0 0 0.5rem 0 #0099ff44;
        border-radius: 0.5rem;
        padding: 0.5rem;
        transform: translateY(120%);
        transform-origin: 50% 100% 0;
        opacity: 0;
        transition: transform 300ms, opacity 300ms;
        background-image: linear-gradient(60deg, #0099ff22 0%, #0099ff11 70%, #0099ff22 100%);
    }
    .miw-box-container.showup {
        transform: translateY(0%);
        opacity: 1;
    }
    .miw-icon-box {
        width: 1rem;
        height: 1rem;
    }
    .miw-text-box{
        flex: 1;
        font-size: 0.8rem;
        padding: 0 0.5rem;
        min-height: 1.2rem;
    }
</style>