/*
    2024年6月8日
    页面路由切换控制器
*/
import myStorage from "@/utils/mystorage.js"

const HRL_KEY_NAME = "history_route_list";

export default {
    state(){
    	return {
    		isRouterBack: null,//是否是路由返回，null-首次加载，true-点了返回按钮，false-进入新页面
            historyRouteList: (myStorage.onceObject(HRL_KEY_NAME) || []), //历史路由路径
    	}
    },
    mutations: {
        UPDATE_KEEP_ALIVE_INCLUDES(state, payload){//更新包含项
            //console.log(payload);
            if(payload?.toName){
                //如果 payload.fromName 为 null，可能是刷新或首次进来，因此尝试取最后的项的索引
                //如果是刷新：state.historyRouteList.length 大于 0，否则是首次进来！！！
                const idxF = (payload.fromName ? state.historyRouteList.findIndex(vx => vx[1] === payload.fromPath) : state.historyRouteList.length - 1);
                const idxT = state.historyRouteList.findIndex(vx => vx[1] === payload.toPath);
                
                if(idxF >= 0){
                    if(idxT < 0){//页面前进
                        state.historyRouteList.push([payload.toName, payload.toPath]);
                        state.isRouterBack = false;
                    } else if(idxF > idxT){//页面后退
                        state.historyRouteList.splice(idxT + 1);
                        state.isRouterBack = true;
                    } else {//可能是页面刷新
                        state.isRouterBack = null;
                        console.warn(`检测到路由堆栈异常：目标路由（${payload.toName}）已在访问历史中，可能会造成视图切换动画错乱！`);
                    }
                } else {
                    if(!payload.fromName){//首次进来，先清空再添加！
                        state.historyRouteList.splice(0, state.historyRouteList.length, [payload.toName, payload.toPath]);
                        state.isRouterBack = null;
                    } else if(idxT < 0){//页面前进
                        state.historyRouteList.push([payload.fromName, payload.fromPath], [payload.toName, payload.toPath]);
                        state.isRouterBack = false;
                    } else {//可能是后退
                        state.isRouterBack = true;
                        console.warn(`检测到路由堆栈异常：源路由（${payload.fromName}）在堆栈中缺失，可能会造成视图切换动画错乱！`);
                    }
                }
                
                //console.log(idxF, idxT);
                //临时保存起来防止刷新后切换效果失效！
                myStorage.onceObject(HRL_KEY_NAME, state.historyRouteList);
            } else {
                console.warn("检测到路由堆栈异常：目标路由没有名称，可能无法实现视图切换动画和视图缓存功能！");
            }
        },
        CLEAR_KEEP_ALIVE_INCLUDES(state, payload){//清空包含项
            if(payload){
                state.historyRouteList.splice(0);
                state.isRouterBack = null;
            }
            myStorage.onceObject(HRL_KEY_NAME, null);
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