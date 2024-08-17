import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import routeController from "./routeController";
import moduleSettings from "./moduleSettings";
import userInfo from "./userInfo";

const myModules = {
    routeController,
    moduleSettings,
    userInfo
};

const myGetters = {
    isRouterBack: (state) => state.routeController.isRouterBack,
    keepAliveIncludes: (state) => state.routeController.keepAliveIncludes,
    
    mapAdministrativeType: (state) => state.moduleSettings.mapAdministrativeType,
    canalDisplayType: (state) => state.moduleSettings.canalDisplayType,
    
    pickPlaceAddress: (state) => state.moduleSettings.pickPlaceAddress,
    pickPlaceTitle: (state) => state.moduleSettings.pickPlaceTitle,
    pickPlaceLongitude: (state) => state.moduleSettings.pickPlaceLongitude,
    pickPlaceLatitude: (state) => state.moduleSettings.pickPlaceLatitude,
    
    pickUserNickName: (state) => state.moduleSettings.pickUserNickName,
    pickUserAvatarUrl: (state) => state.moduleSettings.pickUserAvatarUrl,
    
    isUserLogined: (state) => !!state.userInfo.authToken,
    currentUserNickName: (state) => state.userInfo.nickName,
    currentUserAvatarUrl: (state) => state.userInfo.avatarUrl,
};

const dataState = createPersistedState({//持久化存储
    storage: window.localStorage,
    key: "xlttweb_vuex_storage",
    paths: ["userInfo"] 
});

const vuexStore = createStore({
    modules: myModules,
    getters: myGetters,
    plugins: [dataState]
});

export default vuexStore;