/*
    2024年6月8日
    页面路由切换控制器
*/
export default {
    state(){
    	return {
    		isRouterBack: false,//是否是路由返回，null-首次加载，true-点了返回按钮，false-进入新页面
    		keepAliveExclude: [] //keepAlive 排除项
    	}
    },
    mutations: {
        SET_IS_ROUTER_BACK(state, payload){//null-首次加载，true-点了返回按钮，false-进入新页面
        	state.isRouterBack = payload;
        },
        ADD_KEEP_ALIVE_EXCLUDE(state, payload){//添加排除项
        	if(payload && state.keepAliveExclude.indexOf(payload) < 0){
        		state.keepAliveExclude.push(payload);
        	}
        },
        REMOVE_KEEP_ALIVE_EXCLUDE(state, payload){//移除排除项
        	const nth = state.keepAliveExclude.indexOf(payload);
        	if(nth >= 0){
        		state.keepAliveExclude.splice(nth, 1);
        	}
        },
        CLEAR_KEEP_ALIVE_EXCLUDE(state){
        	state.keepAliveExclude.splice(0);
        }
    },
    actions: {
        setIsRouterBack({ commit }, payload){
            commit("SET_IS_ROUTER_BACK", payload);
        },
        addKeepAliveExclude({ commit }, payload){
            commit("ADD_KEEP_ALIVE_EXCLUDE", payload);
        },
        removeKeepAliveExclude({ commit }, payload){
            commit("REMOVE_KEEP_ALIVE_EXCLUDE", payload);
        },
        clearKeepAliveExclude({ commit }, payload){
            commit("CLEAR_KEEP_ALIVE_EXCLUDE", payload);
        }
    }
}