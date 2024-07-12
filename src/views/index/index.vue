<template>
    <div class="wh-s fx-vm">
        <span class="index-loading-text">正在加载…</span>
    </div>
</template>

<script setup name="IndexIndex">
    import { useRouter } from "vue-router";
    import { onMounted, nextTick } from "vue";
    
    const $router = useRouter();
    
    function gotoMap3dPage(){
        $router.replace("/map3d");
    }
    
    onMounted(() => {
        nextTick(gotoMap3dPage);
    });
</script>

<style scoped="scoped">
    .index-loading-text{
        font-size: 1rem;
        font-weight: bold;
        background-image: linear-gradient(90deg, var(--main-color) 0%, #a7d129 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
</style>