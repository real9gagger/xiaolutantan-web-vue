import { createRouter, createWebHistory } from "vue-router"
import { appWebName } from "@/assets/data/constants.js"
import vuexStore from "@/store/index.js"
import routerList from "./pages.js"

const myRouter = createRouter({
	routes: routerList,
    history: createWebHistory(process.env.BASE_URL),
	//scrollBehavior: function(to, from, savedPosition){}
});
const isDevEnv = (process.env.NODE_ENV === "development"); //开发环境暂时禁用跳转到入口页的功能！

//添加导航守卫，用的是 vue-router4：https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
myRouter.beforeEach(function(to, from){
    if(!isDevEnv && !from.name && !to.meta.isBypassEntrance && !to.query.is_bypass_entrance){//如果是首次进这个网站的，并且不是绕过入口页，并且也不带指定的参数
        return ("/entrance?goto_url=" + encodeURIComponent(to.fullPath));
    } else if(to.meta.loginRequired && !vuexStore.getters.isUserLogined){
        return ("/login?redirect_url=" + encodeURIComponent(to.fullPath));
    } else {
        return true;
    }
});

myRouter.afterEach(function(to, from){
    vuexStore.dispatch("updateKeepAliveIncludes", {
        toName: (to.matched.length ? to.matched[0].components.default.name : null),
        toPath: to.fullPath,
        fromName: (from.matched.length ? from.matched[0].components.default.name : null),
        fromPath: from.fullPath
    });

    if(to.meta.showPageTitle){
        document.title = to.name;
    } else {
        document.title = appWebName;
    }
});

export default myRouter;