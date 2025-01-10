<template>
    <div class="bg-00 fx-vm hi-cwh of-h" style="touch-action:none">
        <gesture-image alt="预览图片" :src="picUrl || publicAssets.imageImgError" :threshold="0" onerror="onImageLoadingError()" />
    </div>
</template>

<script setup name="IndexMap3DImagePreview">
    import { ref, onUnmounted } from "vue";
    import { getPageTempData, setPageTempData } from "@/utils/pagehelper.js";
    import gestureImage from "@/components/gestureImage.vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const picUrl = ref(getPageTempData());
    
    onUnmounted(() => {
        setPageTempData(null);
    });
</script>

<style scoped="scoped">
</style>