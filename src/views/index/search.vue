<template>
    <div class="page-limit-width">
        <div class="content-cage" style="padding:0.5rem">
            <modern-search-box placeholder="搜索照片集" :readonly="false" @search="onSearch" />
        </div>
    </div>
</template>

<script setup name="IndexSearch">
    import { ref } from "vue";
    
    function onSearch(kw){
        console.log(kw);
    }
</script>

<style scoped="scoped">
</style>