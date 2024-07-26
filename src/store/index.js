import { createStore } from "vuex";
import routeController from "./routeController";
import moduleSettings from "./moduleSettings";

const myModules = {
    routeController,
    moduleSettings
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
};

const vuexStore = createStore({
    modules: myModules,
    getters: myGetters
});

export default vuexStore;