import { createApp } from 'vue';
import { register as swiperRegister } from 'swiper/swiper-element-bundle';
import App from './App.vue';
import MyRouter from './router';
import VuexStore from './store';

const myApp = createApp(App);

myApp.config.globalProperties.$appName = '小鹿坦坦';

swiperRegister();

myApp.use(MyRouter);
myApp.use(VuexStore);
myApp.mount('#xlttapp');
