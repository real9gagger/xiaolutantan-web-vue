<template>
    <genz-scroll-view
    :lower-disabled="true"
    :lower-immediately="false"
    class="page-limit-width"
    @click="clearCurrentIndex">
        <div class="content-cage" style="padding:0">
            <ul class="pnl-ul-box">
                <panoramic-list-item v-for="item,index in panoList"
                    :key="item.id"
                    :item-info="item"
                    :item-index="index"
                    :is-actived="currentIndex===index"
                    @itemtap="gotoPanoramicView"
                />
            </ul>
        </div>
    </genz-scroll-view>
</template>

<script setup name="CanalPanoramicList">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import { panoList } from "@/assets/data/constants.js";
    import panoramicListItem from "@/listitems/panoramicListItem.vue";
    
    const $router = useRouter();
    const currentIndex = ref(-1);
    
    function gotoPanoramicView(idx){
        currentIndex.value = idx;
        $router.push("/panoramicview?id=" + panoList[idx].id);
    }
    
    function clearCurrentIndex(){
        currentIndex.value = -1;
    }
</script>

<style scoped="scoped">
    .pnl-ul-box{
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: 0.2rem;
        padding: 0.2rem;
    }
</style>