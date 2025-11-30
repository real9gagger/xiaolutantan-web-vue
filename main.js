/*
  本文件的目的只是想让 Github 识别项目的开发语言，无任何其他用处
*/

import { createApp } from 'vue';
import { register as swiperRegister } from 'swiper/swiper-element-bundle';
import App from './App.vue';
import MyRouter from './router';
import VuexStore from './store';
import genzScrollView from '@/components/genzScrollView';
import modernSearchBox from '@/components/modernSearchBox';

swiperRegister();

const myApp = createApp(App);

myApp.component('GenzScrollView', genzScrollView); //Z世代风格的滚动视图（支持上拉加载和下拉刷新）
myApp.component('ModernSearchBox', modernSearchBox); //搜索框

myApp.use(MyRouter);
myApp.use(VuexStore);

myApp.mount('#xlttapp');
