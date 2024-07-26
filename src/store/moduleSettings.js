export default {
    state(){
    	return {
    		mapAdministrativeType: 0, //显示的地图行政区域类型：市、县、镇
            canalDisplayType: 0, //显示的运河方式：单段显示、分段显示
            pickPlaceAddress: "", //选取的地点的地址
            pickPlaceTitle: "", //选取的地点的名称
            pickPlaceLongitude: 0, //选取的地点的经度
            pickPlaceLatitude: 0, //选取的地点的纬度
    	}
    },
    mutations: {
        TOGGLE_MAP_ADMINISTRATIVE_TYPE(state, payload){
            state.mapAdministrativeType = (+payload || 0);
        },
        TOGGLE_CANAL_DISPLAY_TYPE(state, payload){
            state.canalDisplayType = (+payload || 0);
        },
        SET_PICK_PLACE_INFO(state, payload){
            if(payload && payload.address && payload.title && payload.point){
                state.pickPlaceAddress = payload.address;
                state.pickPlaceTitle = payload.title;
                state.pickPlaceLongitude = payload.point.lng;
                state.pickPlaceLatitude = payload.point.lat;
            } else {
                state.pickPlaceAddress = "";
                state.pickPlaceTitle = "";
                state.pickPlaceLongitude = 0;
                state.pickPlaceLatitude = 0;
            }
        }
    },
    actions: {
        toggleMapAdministrativeType({ commit }, payload){
            commit("TOGGLE_MAP_ADMINISTRATIVE_TYPE", payload);
        },
        toggleCanalDisplayType({ commit }, payload){
            commit("TOGGLE_CANAL_DISPLAY_TYPE", payload);
        },
        setPickPlaceInfo({ commit }, payload){
            commit("SET_PICK_PLACE_INFO", payload);
        }
    },
}