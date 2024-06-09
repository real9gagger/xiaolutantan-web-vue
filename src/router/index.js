import { createRouter, createWebHistory } from "vue-router"
import vuexStore from "@/store/index.js"
import routerList from "./pages.js"

const myRouter = createRouter({
	routes: routerList,
    history: createWebHistory(),
	//scrollBehavior: function(to, from, savedPosition){}
});

//添加导航守卫，用的是 vue-router4
myRouter.beforeEach((to, from, next) => {
	next();
});

myRouter.afterEach((to, from) => {
    console.log(to, from, typeof to.matched[0].components.default)
    vuexStore.dispatch("updateKeepAliveIncludes", {
        toComponentName: (to.matched.length ? to.matched[0].components.default.name : null),
        fromComponentName: (from.matched.length ? from.matched[0].components.default.name : null)
    });
});

export default myRouter;