<template>
    <div @click="gotoTestPage">{{ffff}}</div>
</template>

<script setup name="IndexIndex">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    
    const $router = useRouter();
    const ffff = ref(900);
    
    function gotoTestPage(){
        $router.push("/test");
        ffff.value+=9;
    }
</script>

<style scoped="scoped">
</style>