<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0">
            <div class="mni-user-bg" @click="gotoShareAdd"></div>
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
    .mni-user-bg{
        background-color: red;
        height: 25%;
    }
</style>