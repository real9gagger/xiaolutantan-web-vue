import { createRouter, createWebHistory } from "vue-router"
import { appWebName } from "@/assets/data/constants.js"
import vuexStore from "@/store/index.js"
import routerList from "./pages.js"

const myRouter = createRouter({
	routes: routerList,
    history: createWebHistory(),
	//scrollBehavior: function(to, from, savedPosition){}
});

//添加导航守卫，用的是 vue-router4
myRouter.beforeEach(function(to, from){
	return true;
});

myRouter.afterEach(function(to, from){
    vuexStore.dispatch("updateKeepAliveIncludes", {
        toComponentName: (to.matched.length ? to.matched[0].components.default.name : null),
        fromComponentName: (from.matched.length ? from.matched[0].components.default.name : null)
    });

    if(to.meta.showPageTitle){
        document.title = to.name;
    } else {
        document.title = appWebName;
    }
});

export default myRouter;