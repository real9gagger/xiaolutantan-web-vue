<template>
    <div class="wh-s fx-vm"><span class="page-loading-tips">正在加载…</span></div>
</template>

<script setup name="IndexEntrance">
    /**
     * 此页面是非首页进入应用时必经的入口页
     * 
     * 【2025年1月15日】
     * 判断应用如果不是从首页进来的，就重定向到此页面，便于页面后退时返回应用首页！
     * 这种方式需要用户与页面有交互才生效，比如触控、点击，鼠标操作等。如果没有交互就按手机返回键，则此方式无效。
     * 使用场景：比如我从别人分享的链接进入了视频详情页，如果没有此页面，那么按手机返回键时，就直接退出了应用。
     * 有了本入口页面，按手机返回键时会返回到应用首页。
    */
   
    import { onActivated } from "vue";
    import { useStore } from "vuex";
    import { useRoute, useRouter } from "vue-router";
    
    defineOptions({
        name: "IndexEntrance"
    });
    
    const $route = useRoute();
    const $router = useRouter();
    const $store = useStore();
    const nonRVs = { //非响应式变量（non Responsive Variables）
        isFirstComeIn: true, //是否是首次进来的
    };
    
    onActivated(() => {
        if(!nonRVs.isFirstComeIn || !$route.query?.goto_url){
            $store.dispatch("clearKeepAliveIncludes", false);
            window.location.replace(location.origin); //路由后退到此页面时，重定向到首页！
        } else {
            nonRVs.isFirstComeIn = false;
            console.log("由于应用不是从首页进来的，已重定向到本应用的入口页，便于页面后退时返回应用首页！");
            $router.push(decodeURIComponent($route.query.goto_url));
        }
    });
</script>

<style scoped="scoped">
</style>