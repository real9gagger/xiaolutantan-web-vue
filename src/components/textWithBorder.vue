<template>
    <p class="ps-r zi-1">
        <span class="twb-text-bg" :style="textStrokeStyle">{{content}}</span>
        <span class="ps-r zi-1" :class="ctcss">{{content}}</span>
    </p>
</template>

<script setup name="TextWithBorder">
    import { computed } from "vue";
    
    const props = defineProps({
        content: {
            type: String,
            default: ""
        },
        bdcolor: {//border-color
            type: String,
            default: "#000"
        },
        bdwidth: { //border-width，单位像素
            type: Number,
            default: 2
        },
        ctcss: {//content css
            type: String,
            default: ""
        }
    });
    
    const textStrokeStyle = computed(() => {
        if(props.bdcolor && props.bdwidth > 0){
            return `-webkit-text-stroke:${props.bdcolor} ${props.bdwidth}px`;
        } else {
            return "";
        }
    });
</script>

<style>
    .twb-text-bg{
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        z-index: 0;
        padding: inherit;
        padding-left: inherit;
        padding-right: inherit;
        padding-top: inherit;
        padding-bottom: inherit;
    }
</style>