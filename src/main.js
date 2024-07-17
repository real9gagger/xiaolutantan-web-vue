import { createApp } from 'vue';
import { register as swiperRegister } from 'swiper/swiper-element-bundle';
import App from './App.vue';
import MyRouter from './router';
import VuexStore from './store';

swiperRegister();

const myApp = createApp(App);
myApp.use(MyRouter);
myApp.use(VuexStore);
myApp.mount('#xlttapp');
