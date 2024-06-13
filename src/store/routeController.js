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
                const idxF = (payload.fromComponentName ? state.keepAliveIncludes.lastIndexOf(payload.fromComponentName) : (state.keepAliveIncludes.length - 1));
                const idxT = state.keepAliveIncludes.lastIndexOf(payload.toComponentName);
                if(idxF < 0){
                    if(!payload.fromComponentName){//首次进来，先清空再添加！
                        state.keepAliveIncludes.splice(0, state.keepAliveIncludes.length, payload.toComponentName);
                        state.isRouterBack = null;
                    } else if(idxT < 0){//页面前进
                        state.keepAliveIncludes.push(payload.fromComponentName, payload.toComponentName);
                        state.isRouterBack = false;
                    } else {//可能是前进
                        state.keepAliveIncludes.splice(idxT, 0, payload.fromComponentName);
                        state.isRouterBack = false;
                        console.warn(`检测到路由堆栈异常：源路由（${payload.fromComponentName}）在堆栈中缺失，可能会造成视图切换动画错乱！`);
                    }
                } else {
                    if(idxT < 0){//页面前进
                        state.keepAliveIncludes.push(payload.toComponentName);
                        state.isRouterBack = false;
                    } else if(idxF > idxT){//页面后退
                        state.keepAliveIncludes.splice(idxT + 1);
                        state.isRouterBack = true;
                    } else if(idxF === idxT){//页面刷新
                        state.isRouterBack = null;
                    } else {//可能是前进
                        state.isRouterBack = false;
                        console.warn(`检测到路由堆栈异常：目标路由（${payload.toComponentName}）已在访问历史中，可能会造成视图切换动画错乱！`);
                    }
                }
                //console.log(idxF, idxT);
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