/*
    2024年6月8日
    页面路由切换控制器
*/
import myStorage from "@/utils/mystorage.js"

const KAI_KEY_NAME = "keep_alive_includes";

export default {
    state(){
    	return {
    		isRouterBack: null,//是否是路由返回，null-首次加载，true-点了返回按钮，false-进入新页面
            keepAliveIncludes: (myStorage.onceObject(KAI_KEY_NAME) || []) //keepAlive 包含的项
    	}
    },
    mutations: {
        UPDATE_KEEP_ALIVE_INCLUDES(state, payload){//更新包含项
            if(payload && payload.toComponentName){
                //如果 payload.fromComponentName 为 null，可能是刷新或首次进来，因此尝试取最后的项的索引
                //如果是刷新：state.keepAliveIncludes.length 大于 0，否则是首次进来！！！
                const idxF = (payload.fromComponentName ? state.keepAliveIncludes.indexOf(payload.fromComponentName) : (state.keepAliveIncludes.length - 1));
                const idxT = state.keepAliveIncludes.indexOf(payload.toComponentName);
                if(idxF < 0){
                    if(!payload.fromComponentName){//首次进来
                        state.keepAliveIncludes.push("/", payload.toComponentName);
                        state.isRouterBack = null;
                    } else if(idxT < 0){//页面前进
                        state.keepAliveIncludes.push(payload.fromComponentName, payload.toComponentName);
                        state.isRouterBack = false;
                    } else {//可能是前进
                        state.keepAliveIncludes.splice(idxT, 0, payload.fromComponentName);
                        state.isRouterBack = false;
                    }
                } else {
                    if(idxT < 0){//页面前进
                        state.keepAliveIncludes.push(payload.toComponentName);
                        state.isRouterBack = false;
                    } else if(idxF === (idxT + 1)){//页面后退
                        state.keepAliveIncludes.splice(idxF, 1);
                        state.isRouterBack = true;
                    } else if(idxF === idxT){//页面刷新
                        state.isRouterBack = null;
                    } else {//可能是前进
                        state.keepAliveIncludes.push(payload.toComponentName);
                        state.isRouterBack = false;
                    }
                }
                //console.log(idxF, idxT, state.keepAliveIncludes);
                //临时保存起来防止刷新后切换效果失效！
                myStorage.onceObject(KAI_KEY_NAME, state.keepAliveIncludes);
            }
        },
        CLEAR_KEEP_ALIVE_INCLUDES(state){//清空包含项
        	state.keepAliveIncludes.splice(0);
            state.isRouterBack = null;
        }
    },
    actions: {
        updateKeepAliveIncludes({ commit }, payload){
            commit("UPDATE_KEEP_ALIVE_INCLUDES", payload);
        },
        clearKeepAliveIncludes({ commit }, payload){
            commit("CLEAR_KEEP_ALIVE_INCLUDES", payload);
        }
    }
}