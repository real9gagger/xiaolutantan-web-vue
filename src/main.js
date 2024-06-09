import { createApp } from 'vue';
import App from './App.vue';
import MyRouter from './router';

const myApp = createApp(App);

myApp.use(MyRouter);

myApp.mount('#xlttapp');
