<template>
    <div class="page-limit-width">
        <div class="content-cage" @click="gotoPanoramicView"></div>
    </div>
</template>

<script setup name="CanalPanoramicList">
    import { useRouter } from "vue-router";
    const $router = useRouter();
    
    function gotoPanoramicView(){
        $router.push("/panoramicview");
    }
</script>

<style scoped="scoped">
</style>