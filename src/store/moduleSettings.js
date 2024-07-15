export default {
    state(){
    	return {
    		mapAdministrativeType: 0, //显示的地图行政区域类型：市、县、镇
            canalDisplayType: 0, //显示的运河方式：单段显示、分段显示
    	}
    },
    mutations: {
        TOGGLE_MAP_ADMINISTRATIVE_TYPE(state, payload){
            state.mapAdministrativeType = (+payload || 0);
        },
        TOGGLE_CANAL_DISPLAY_TYPE(state, payload){
            state.canalDisplayType = (+payload || 0);
        },
    },
    actions: {
        toggleMapAdministrativeType({ commit }, payload){
            commit("TOGGLE_MAP_ADMINISTRATIVE_TYPE", payload);
        },
        toggleCanalDisplayType({ commit }, payload){
            commit("TOGGLE_CANAL_DISPLAY_TYPE", payload);
        },
    },
}