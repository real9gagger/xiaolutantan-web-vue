<template>
    <div class="page-limit-width">
        <div class="content-cage fx-vm" style="padding:0;overflow:hidden;touch-action:none;">
            <gesture-image alt="预览图片" :src="picUrl || publicAssets.imageImgError" :threshold="0" onerror="onImageLoadingError()" />
        </div>
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