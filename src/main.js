import { createApp } from 'vue';
import App from './App.vue';
import MyRouter from './router';
import VuexStore from './store';

const myApp = createApp(App);

myApp.use(MyRouter);
myApp.use(VuexStore);

myApp.mount('#xlttapp');
