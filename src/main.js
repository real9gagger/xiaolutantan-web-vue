import { createApp } from 'vue';
import { register as swiperRegister } from 'swiper/swiper-element-bundle';
import App from './App.vue';
import MyRouter from './router';
import VuexStore from './store';
import genzScrollView from '@/components/genzScrollView';

swiperRegister();

const myApp = createApp(App);

myApp.component('GenzScrollView', genzScrollView); //Z世代风格的滚动视图（支持上拉加载和下拉刷新）

myApp.use(MyRouter);
myApp.use(VuexStore);
myApp.mount('#xlttapp');
