<template>
    <div class="page-limit-width">
        <div class="content-cage">
            <h4 class="mds-row-title">行政区域</h4>
            <div class="fx-r fx-wp">
                <div v-for="item in arList" class="mds-row-item" 
                    :key="item.typeCode"
                    :class="{'selected': maType===item.typeCode, 'lastone': item.isLastOne}" 
                    @click="toggleRegion(item.typeCode)">
                    <img class="mds-row-pic" :src="item.iconPath" />
                    <span class="mds-row-desc">{{item.title}}</span>
                </div>
            </div>
            
            <h4 class="mds-row-title mg-t-1rem">运河</h4>
            <div class="fx-r fx-wp">
                <div v-for="item in canalTypes" class="mds-row-item"
                    :key="item.typeCode"
                    :class="{'selected': cdType===item.typeCode, 'lastone': item.isLastOne}" 
                    @click="toggleDisplayMode(item.typeCode)">
                    <img class="mds-row-pic" :src="item.iconPath" />
                    <span class="mds-row-desc">{{item.title}}</span>
                </div>
            </div>
        </div>
        <div class="fixed-limit-width po-br-0 pd-1rem">
            <button class="btn-box" @click="onConfirm">完 成</button>
        </div>
    </div>
</template>

<script setup name="IndexMap3DDisplaySetting">
    import { ref } from "vue";
    import { useStore } from "vuex";
    import { useRouter } from "vue-router";
    import { administrativeRegion, canalDisplayMode } from "@/assets/data/constants.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const $store = useStore();
    const $router = useRouter();
    const maType = ref($store.getters.mapAdministrativeType);
    const cdType = ref($store.getters.canalDisplayType);
    const arList = [
        {
            title: "不显示",
            iconPath: publicAssets.imageRegionNone,
            typeCode: administrativeRegion.REGION_NONE
        },
        {
            title: "周边市",
            iconPath: publicAssets.imageRegionShi,
            typeCode: administrativeRegion.REGION_SHI
        },
        {
            title: "周边县",
            iconPath: publicAssets.imageRegionXian,
            typeCode: administrativeRegion.REGION_XIAN
        },
        {
            title: "周边乡镇",
            iconPath: publicAssets.imageRegionZhen,
            typeCode: administrativeRegion.REGION_ZHEN,
            isLastOne: true
        }
    ];
    const canalTypes = [
        {
            title: "不显示",
            iconPath: publicAssets.imageRegionNone,
            typeCode: canalDisplayMode.NOT_DISPLAY
        },
        {
            title: "单段显示",
            iconPath: publicAssets.imageCanalSingle,
            typeCode: canalDisplayMode.NORMAL_DISPLAY
        },
        {
            title: "分段显示",
            iconPath: publicAssets.imageCanalSegmented,
            typeCode: canalDisplayMode.SEGMENTED_DISPLAY,
            isLastOne: true
        }
    ];
    
    function toggleRegion(code){
        maType.value = code;
    }
    function toggleDisplayMode(code){
        cdType.value = code;
    }
    function onConfirm(){
        if($store.getters.mapAdministrativeType !== maType.value){
            $store.dispatch("toggleMapAdministrativeType", maType.value);
        }
        if($store.getters.canalDisplayType !== cdType.value){
            $store.dispatch("toggleCanalDisplayType", cdType.value);
        }
        $router.back();
    }
</script>

<style scoped="scoped">
    .mds-row-title{
        display: block;
        font-size: 0.9rem;
        font-weight: bold;
    }
    .mds-row-item{
        width: auto;
        margin: 0.5rem 0.4rem 0 0 ;
        cursor: pointer;
    }
    .mds-row-item.lastone{
        margin-right: 0 !important;
    }
    .mds-row-item.selected{
        color: var(--main-color);
    }
    .mds-row-item.selected > img{
        border-color: var(--main-color);
    }
    .mds-row-pic{
        display: block;
        width: 4.2rem;
        height: 4.2rem;
        border: 0.1rem solid #fff;
    }
    .mds-row-desc{
        display: block;
        text-align: center;
        width: 100%;
        padding: 0.2rem 0;
        font-size: 0.7rem;
    }
</style>