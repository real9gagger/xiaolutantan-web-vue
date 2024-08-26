<template>
    <transition name="ppx-slide-out">
        <div v-if="isVisible" class="ppx-box-container">
            <div class="fx-g1 wi-f" @click="onClose"><!-- 点我关闭层 --></div>
            <div class="ppx-box-dialog">
                <p v-if="props.title" class="ta-c tc-66 mg-1rem lh-1x of-lc1">{{props.title}}</p>
                <template v-for="item in props.buttons">
                    <button v-if="!item.hidden" :key="item.key" @click="onButtonClick(item.key)" type="button" class="ppx-btn-box fw-b">{{item.name}}</button>
                </template>
                <button type="button" class="ppx-btn-box" @click="onClose">取消</button>
            </div>
        </div>
    </transition>
</template>

<script setup name="ActionPopup">
    import { defineProps, defineModel } from "vue";
    
    const isVisible = defineModel({
        type: Boolean,
        default: false
    });
    const props = defineProps({
        buttons: {
            type: Array,
            default: () => []
        },
        title: {
            type: String,
            default: ""
        }
    });
    const emits = defineEmits(["close", "action"]);
    
    function onClose(){
        isVisible.value = false;
        emits("close", isVisible.value);
    }
    function onButtonClick(key){
        isVisible.value = false;
        emits("action", key);
    }
</script>

<style>
    .ppx-box-container{
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem;
    }
    .ppx-box-dialog{
        width: 100%;
        max-width: 600px;
        background-color: #fff;
        padding: 0;
        border-radius: 1rem;
        overflow: hidden;
        user-select: none;
        transition: transform 300ms cubic-bezier(0, 0, 0, 1) 0s;
    }
    .ppx-btn-box{
        display: block;
        background-color: #fff;
        width: 100%;
        font-size: 0.8rem;
        padding: 1rem;
        line-height: 1;
        color: #333;
    }
    .ppx-btn-box:hover,
    .ppx-btn-box:active{
        background-color: #eee;
        color: var(--main-color);
    }
    
    .ppx-slide-out-enter-from{opacity:0}
    .ppx-slide-out-enter-active{transition:opacity 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .ppx-slide-out-enter-to{opacity:1}
    .ppx-slide-out-leave-from{opacity:1}
    .ppx-slide-out-leave-active{transition:opacity 300ms cubic-bezier(0, 0, 0, 1) 0s}
    .ppx-slide-out-leave-to{opacity:0}
    
    .ppx-slide-out-enter-from > .ppx-box-dialog{transform:translateY(30%)}
    .ppx-slide-out-enter-to > .ppx-box-dialog{transform:translateY(0%)}
    .ppx-slide-out-leave-from > .ppx-box-dialog{transform:translateY(0%)}
    .ppx-slide-out-leave-to > .ppx-box-dialog{transform:translateY(30%)}
</style>