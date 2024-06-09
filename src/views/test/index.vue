<template>
    <div class="pd-1rem">
        <h4 class="ta-c pd-rem5">测试中心</h4>
        <div class="mg-t-1rem ta-c">
            <button class="btn-box wi-f" @click="gotoMapDev">地图开发测试</button>
        </div>
    </div>
</template>

<script setup name="TestIndex">
    import { useRouter } from "vue-router";
    
    const $router = useRouter();
    
    function gotoMapDev(){
        $router.push("/testmapdev");
    }
</script>

<style>
</style>