import { createRouter, createWebHistory } from "vue-router"
import myStore from "@/utils/mystore.js"
import vuexStore from "@/store/index.js"
import routerList from "./pages.js"

let myRouter = createRouter({
	routes: routerList,
    history: createWebHistory(),
	//scrollBehavior: function(to, from, savedPosition){}
});

let historyPaths = "";
let currentCName = "";//当前Vue控件名称

function isFirstin(){
	if(!historyPaths){
		historyPaths = ",/index";
		myStore.onceString("router_history_paths", historyPaths);
		return true;
	}
	return false;
}

function isGoback(toPath, fromPath){
	if(historyPaths.endsWith(`,${toPath},${fromPath}`)){
		vuexStore.dispatch("setIsRouterBack", true);
		vuexStore.dispatch("addKeepAliveExclude", currentCName);
		historyPaths = historyPaths.substr(0, historyPaths.length - fromPath.length - 1);
		myStore.onceString("router_history_paths", historyPaths);
		return true;
	}
	return false;
}

function isRefresh(toPath){
	if(historyPaths.endsWith(`,${toPath}`)){
		vuexStore.dispatch("setIsRouterBack", null);
		vuexStore.dispatch("clearKeepAliveExclude");
		return true;
	}
	return false;
}

function isReplace(fullPath, toPath){
	if(fullPath.endsWith("IS_REPLACE_ROUTER=1")){//使用路由替换功能时，请加上这个属性 IS_REPLACE_ROUTER=1
		vuexStore.dispatch("addKeepAliveExclude", currentCName);
		let idot = historyPaths.lastIndexOf(",");
		if(idot >= 0){
			historyPaths = historyPaths.substr(0, idot + 1) + toPath;
		} else {
			historyPaths = `,${toPath}`;
		}
		myStore.onceString("router_history_paths", historyPaths);
		return true;
	}
	return false;
}

function isForward(toPath){
	vuexStore.dispatch("setIsRouterBack", false);
	vuexStore.dispatch("clearKeepAliveExclude");
	historyPaths += `,${toPath}`;
	myStore.onceString("router_history_paths", historyPaths);
	return true;
}

//添加导航守卫，用的是 vue-router3，而非4，参见 https://v3.router.vuejs.org/zh/guide/advanced/navigation-guards.html
myRouter.beforeEach((to, from, next) => {
	if(!historyPaths){
		historyPaths = myStore.onceString("router_history_paths");
	}

	if(isFirstin()){//首次进入
		return !next("/index");//重定向到首页
	} else if(isRefresh(to.path)){//刷新
		to.meta.keepAlive = true;
	} else if(isReplace(to.fullPath, to.path)){//替换
		to.meta.keepAlive = !(from.meta.keepAlive = false);
	} else if(isGoback(to.path, from.path)){//返回
		from.meta.keepAlive = false;
	} else  {//前进
		to.meta.keepAlive = isForward(to.path);
	}
	
	next();
});

myRouter.afterEach((to, from) => {
	try{
		currentCName = to.matched[0].components.default.name;
	}catch(ex){
		currentCName = "";
	}
});

export default myRouter;