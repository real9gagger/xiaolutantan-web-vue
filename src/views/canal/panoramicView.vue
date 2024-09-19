<template>
    <div class="wi-f hi-cwh" id="krpanoContainer">
        <panorama-loading-box v-if="loadingCode >= 0x1" :is-fade-out="loadingCode === 0x2" @fadeoutend="onLoadingFadeOutEnd" />
        <data-lost-box v-else-if="loadingCode <= -0x1" title="景点已失效" />
        <!-- <iframe src="https://www.720yun.com/t/34vk6edyp7y?scene_id=99822525" class="wh-s bd-0"></iframe> -->
    </div>
</template>

<script setup name="CanalPanoramicView">
    import { ref, nextTick, onActivated, onDeactivated } from "vue";
    import { useRoute } from "vue-router";
    import { panoList } from "@/assets/data/constants.js";
    import panoramaLoadingBox from "@/components/panoramaLoadingBox.vue";
    import dataLostBox from "@/components/dataLostBox.vue";
    
    const $route = useRoute();
    const scenesID = (+$route.query.id || 0); //场景ID
    const loadingCode = ref(0x1); // -1 数据失效。1 正在加载。2 加载成功，准备关闭动画。0 关闭动画完成
    
    function renderKrpano(){
        const item = panoList.find(vx => vx.id === scenesID);
        
        if(item){
            //参数配置项参见：https://krpano.com/docu/embedpano/#embeddingparameters
            embedpano({
                xml: item.scenesXml, 
                target: "krpanoContainer",
                html5: "only",
                passQueryParameters: "startscene,startlookat",
                bgcolor: "#FFFFFF",
                onready: function(krpano){
                    //console.log(krpano);
                    //参见：https://krpano.com/docu/actions/#events.addListener
                    krpano.events.addListener("onloadcomplete", onKrpanoLoadCompleted, "once");
                    
                    //参见：https://krpano.com/docu/actions/#js。callbackOnKrpanoCompleted 是定义在 window 里的函数！
                    //krpano.set("events.onloadcomplete", `js("callbackOnKrpanoCompleted(${scenesID})")`); //弃用
                }
            });
        } else {
            loadingCode.value = -0x1;
        }
    }
    
    function onKrpanoLoadCompleted(){
        loadingCode.value = 0x2;
    }
    
    function onLoadingFadeOutEnd(){
        loadingCode.value = 0x0;
    }
    
    onActivated(() => {
        nextTick(renderKrpano);
    });
    
    onDeactivated(() => {
       removepano("krpanoContainer");
       console.log("全景信息销毁成功...");
    });
</script>

<style scoped="scoped">
</style>