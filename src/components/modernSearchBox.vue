<template>
    <div class="msb-search-box fx-hc" :class="{'focusing': isSearchFocus}">
        <img :src="isSearchFocus ? publicAssets.iconSearchGreen : publicAssets.iconSearchGrey" alt="搜索" class="wh-1em" />
        <input v-model="searchText" type="search" class="msb-search-input" ref="inputRef"
            :placeholder="props.placeholder" 
            :readonly="props.readonly"
            @click="onInputClick"
            @focus="onInputFocusOrBlur" 
            @blur="onInputFocusOrBlur" 
            @keyup.enter="onSearch" />
        <span class="msb-search-vline" :class="{'focusing': isSearchFocus}"></span>
        <a class="pd-lr-rem8" :class="{'tc-mc': isSearchFocus, 'tc-99': !isSearchFocus}" @click="onSearch">搜索</a>
    </div>
</template>

<script setup name="ModernSearchBox">
    import { nextTick, onMounted, ref } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const emits = defineEmits(["search", "inputclick"]);
    const props = defineProps({
        placeholder: {
            type: String,
            default: "搜索"
        },
        readonly: {
            type: Boolean,
            default: true
        },
        isSearching: {
            type: Boolean,
            default: false
        },
        initiValue: {
            type: String,
            default: ""
        },
        autoFocus: {
            type: Boolean,
            default: true
        }
    });
    
    const isSearchFocus = ref(false);
    const searchText = ref(props.initiValue || "");
    const inputRef = ref(null);
    
    function onSearch(){
        if(!props.isSearching){
            emits("search", searchText.value.trim());
        }
    }
    function onInputFocusOrBlur(evt){
        if(!props.readonly){
            isSearchFocus.value = (evt.type === "focus");
        }
    }
    function onInputClick(evt){
        if(props.readonly){
            emits("inputclick", evt);
        }
    }
    function setInputFocus(){
        inputRef.value?.focus();
    }
    
    onMounted(() => {
        if(props.autoFocus){
            nextTick(setInputFocus);
        }
    });
</script>

<style>
    .msb-search-box{
        border: 0.1rem solid rgba(67, 186, 8, 0.5);
        border-radius: 0.75rem;
        overflow: hidden;
        transition: all 300ms;
        height: 2rem;
        padding-left: 0.8rem;
        background-color: #fff;
        line-height: 1;
        background-image: linear-gradient(225deg, rgba(67, 186, 8, 0.1) 0%, transparent 25%, transparent 75%, rgba(67, 186, 8, 0.1) 100%);
    }
    .msb-search-box.focusing{
        border-color: var(--main-color);
    }
    .msb-search-input{
        border: 0;
        padding: 0 0.6rem;
        flex: 1;
        background-color: transparent;
    }
    .msb-search-input[readonly]{
        cursor: pointer;
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