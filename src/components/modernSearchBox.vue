<template>
    <div class="msb-search-box fx-hc" :class="{'focusing': isSearchFocus}">
        <img :src="isSearchFocus ? publicAssets.iconSearchGreen : publicAssets.iconSearchGrey" alt="搜索" class="wh-1em" />
        <input v-model="searchText" type="search" class="msb-search-input" :placeholder="props.placeholder" 
            @focus="onInputFocusOrBlur" 
            @blur="onInputFocusOrBlur" 
            @keyup.enter="onSearch" />
        <span class="msb-search-vline" :class="{'focusing': isSearchFocus}"></span>
        <span class="pd-lr-rem8" :class="{'tc-mc': isSearchFocus, 'tc-99': !isSearchFocus}" @click="onSearch">搜索</span>
    </div>
</template>

<script setup name="ModernSearchBox">
    import { ref } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const emits = defineEmits(["search"]);
    const props = defineProps({
        placeholder: {
            type: String,
            default: "搜索"
        },
        isSearching: {
            type: Boolean,
            default: false
        },
        initiValue: {
            type: String,
            default: ""
        }
    });
    
    const isSearchFocus = ref(false);
    const searchText = ref(props.initiValue || "");
    
    function onSearch(){
        if(!props.isSearching){
            emits("search", searchText.value.trim());
        }
    }
    function onInputFocusOrBlur(evt){
        isSearchFocus.value = (evt.type === "focus");
    }
</script>

<style>
    .msb-search-box{
        border: 0.1rem solid #ccc;
        border-radius: 1rem;
        overflow: hidden;
        transition: all 300ms;
        height: 2rem;
        padding-left: 0.8rem;
        background-color: #fff;
        line-height: 1;
    }
    .msb-search-box.focusing{
        border-color: var(--main-color);
    }
    .msb-search-input{
        border: 0;
        padding: 0 0.6rem;
        flex: 1;
    }
    .msb-search-vline {
        display: inline-block;
        height: 1rem;
        border-left: 0.1rem solid #ddd;
    }
    .msb-search-vline.focusing{
        border-color: var(--main-color);
    }
</style>