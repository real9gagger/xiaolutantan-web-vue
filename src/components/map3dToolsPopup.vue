<template>
    <transition name="mtp-show-out">
        <ul v-if="isVisible" class="fx-r fx-wp mtp-box-container">
            <li class="fx-vm wh-3rem hv-f0 br-rem5 cs-p" @click="onClose">
                <img :src="publicAssets.svgMapRuler" class="mtp-li-pic" />
                <span class="fs-rem6 tc-66">测距</span>
            </li>
            <li class="fx-vm wh-3rem hv-f0 br-rem5 cs-p" @click="onClose">
                <img :src="publicAssets.svgMeasureArea" class="mtp-li-pic" />
                <span class="fs-rem6 tc-66">测量面积</span>
            </li>
            <li class="fx-vm wh-3rem hv-f0 br-rem5 cs-p" @click="onClose">
                <img :src="publicAssets.svgAddMarker" class="mtp-li-pic" />
                <span class="fs-rem6 tc-66">标记</span>
            </li>
            <li class="fx-vm wh-3rem hv-f0 br-rem5 cs-p" @click="onClose">
                <img :src="publicAssets.svgClearAll" class="mtp-li-pic" />
                <span class="fs-rem6 tc-66">清空</span>
            </li>
            <li class="mtp-ox-horn"></li>
        </ul>
    </transition>
</template>

<script setup name="Map3DToolsPopup">
    import { defineProps, defineModel, ref, getCurrentInstance, nextTick } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const isVisible = defineModel({
        type: Boolean,
        default: false
    });
    
    function onClose(){
        isVisible.value = false;
    }
</script>

<style>
    .mtp-box-container{
        position: fixed;
        right: 3.5rem;
        top: calc(100% - 23.3rem);
        z-index: 4444;
        max-width: 600px;
        background-color: #fff;
        padding: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 0.5rem 0 var(--main-color);
        transition: all 250ms ease 0s;
        transform-origin: 100% 1.8rem;
    }
    .mtp-li-pic{
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        margin-bottom: 0.25rem;
    }
    .mtp-ox-horn{
        position: absolute;
        top: 1rem;
        right: -0.8rem;
        z-index: 0;
        width: 0.8rem;
        height: 0.8rem;
        background-image: linear-gradient(45deg, #fff 50%, #43ba6266 50%, transparent 75%);
    }
    .mtp-ox-horn::after{
        content: "";
        display: block;
        height: inherit;
        position: relative;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 1;
        background-image: linear-gradient(160deg, #fff 25%, #43ba6266 25%, transparent 50%);
    }
    
    .mtp-show-out-enter-from{transform:scale(0, 0.4) translateX(50%);opacity:0}
    .mtp-show-out-enter-to{transform:scale(1, 1) translateX(0);opacity:1}
    .mtp-show-out-leave-from{transform:scale(1, 1) translateX(0);opacity:1}
    .mtp-show-out-leave-to{transform:scale(0, 0.4) translateX(50%);opacity:0}
</style>