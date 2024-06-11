<template>
    <div class="pd-1rem">
        <h4 class="ta-c pd-rem5">测试中心</h4>
        <div class="mg-t-1rem ta-c">
            <button class="btn-box wi-f" @click="gotoMapDev">地图开发测试 {{aliveTimes}}</button>
        </div>
    </div>
</template>

<script setup name="TestIndex">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    
    const $router = useRouter();
    const aliveTimes = ref(90);
    
    function gotoMapDev(){
        $router.push("/testmapdev");
        aliveTimes.value += 10;
    }
</script>

<style>
</style>