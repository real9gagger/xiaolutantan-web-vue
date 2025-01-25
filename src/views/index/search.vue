<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0.5rem">
            <modern-search-box placeholder="想看什么，搜一搜" :readonly="false" @search="onSearch" />
        </div>
    </div>
</template>

<script setup name="IndexSearch">
    import { ref } from "vue";
    
    function onSearch(kw){
        appToast("服务器错误！");
        console.log(kw);
    }
</script>

<style scoped="scoped">
</style>