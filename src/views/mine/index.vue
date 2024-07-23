<template>
    <div class="page-limit-width">
        <div class="content-cage" @click="gotoShareAdd">
            
        </div>
    </div>
</template>

<script setup name="MineIndex">
    import { useRouter } from "vue-router";
    const $router = useRouter();
    
    function gotoShareAdd(){
        $router.push("/shareadd");
    }
</script>

<style scoped="scoped">
</style>