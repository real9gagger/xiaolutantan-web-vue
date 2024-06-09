import { createStore } from "vuex";
import routeController from "./routeController";

const myModules = {
    routeController
};

const myGetters = {
    isRouterBack: (state) => state.routeController.isRouterBack,
    keepAliveExclude: (state) => state.routeController.keepAliveExclude,
};

const vuexStore = createStore({
    modules: myModules,
    getters: myGetters
});

export default vuexStore;