<template>
    <div class="wi-f hi-cwh" id="krpanoBox"></div>
    <!-- <iframe src="https://www.720yun.com/t/34vk6edyp7y?scene_id=99822525" class="wh-s bd-0"></iframe> -->
</template>

<script setup name="CanalPanoramicView">
    import { nextTick, onMounted } from "vue";
    
    function renderKrpano(){
        embedpano({
            xml: "/sharepics/panoramic/vtour/tour.xml", 
            target: "krpanoBox",
            html5: "only",
            passQueryParameters: "startscene,startlookat",
        });
    }
    
    onMounted(() => {
        nextTick(renderKrpano);
    });
</script>

<style scoped="scoped">
</style>