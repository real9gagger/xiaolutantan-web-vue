import { createStore } from "vuex";
import routeController from "./routeController";

const myModules = {
    routeController
};

const myGetters = {
    isRouterBack: (state) => state.routeController.isRouterBack,
    keepAliveIncludes: (state) => state.routeController.keepAliveIncludes,
};

const vuexStore = createStore({
    modules: myModules,
    getters: myGetters
});

export default vuexStore;