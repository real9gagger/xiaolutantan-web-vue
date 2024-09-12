<template>
    <div class="page-limit-width">
        <div class="content-cage">
            <h4 class="ta-c pd-rem5">测试中心</h4>
            <div class="mg-t-1rem ta-c">
                <button type="button" class="btn-box wi-f" @click="gotoMapDev">地图开发测试</button>
            </div>
            <div class="mg-t-1rem ta-c">
                <button type="button" class="btn-box wi-f" @click="checkPageName">检查页面是否都有 “name” 属性</button>
            </div>
        </div>
    </div>
</template>

<script setup name="TestIndex">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import routerList from "@/router/pages.js"
    
    const $router = useRouter();
    
    function gotoMapDev() {
        $router.push("/testmapdev");
    }

    function checkPageName() {
        let noNameCount = 0;
        for(const item of routerList){
            if(item.component){
                item.component().then(res => {
                    if(!res.default?.name){
                        console.log("页面 " + item.path + " 没有 “name” 属性！");
                        noNameCount++;
                    }
                }).catch(console.warn);
            }
        }
        setTimeout(() => console.log("检查完毕：" + noNameCount + " 个页面有问题。"), 800);
        appToast("检查结果已打印在控制台...");
    }
</script>

<style scoped="scoped">
</style>