<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0;overflow:hidden;">
            <gesture-image alt="预览图片" :src="picUrl || publicAssets.imageImgError" onerror="onImageLoadingError()" />
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