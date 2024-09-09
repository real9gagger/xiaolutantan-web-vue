<template>
    <router-view v-slot="$scope">
        <transition
            @before-enter="onPageBeforeEnter" 
            @enter="onPageEnter" 
            @after-enter="onPageAfterEnter" 
            @leave="onPageLeave" :css="false">
            <keep-alive :include="$store.getters.keepAliveIncludes" :max="32">
                <component :is="$scope.Component" />
            </keep-alive>
        </transition>
    </router-view>
</template>

<script setup name="XlttApp">
    import { onMounted } from "vue";
    import { useStore } from "vuex";

    const $store = useStore();

    function onPageBeforeEnter(elem){//进入页面时要固定定位
    	//等于null表示首次加载，此时不需要页面切换动画
    	const transX = ($store.getters.isRouterBack ? -100 : ($store.getters.isRouterBack===false ? 100 : 0));        
    	$(elem).css({
    		position: "fixed",
    		inset: "0",
    		zIndex: "99",
    		transform: `translate(${transX}%,0)`, //如果是返回则，往右移动，打开新页面时才往左移动
    		transition: "transform 300ms",
            overflow: "hidden"
    	});
    }
    function onPageEnter(elem, done){//页面进入
        if($store.getters.isRouterBack === null){
            done();
        } else {
            $(elem).on("transitionend", function(){ done() });
            setTimeout(function(){ elem.style.transform = "translate(0,0)" }, 10);
        }
    }
    function onPageAfterEnter(elem){//进入动画执行完，重置
    	elem.style.position = null;
    	elem.style.inset = null;
    	elem.style.zIndex = null;
    	elem.style.transform = null;
    	elem.style.transition = null;
        elem.style.overflow = null;
    }
    function onPageLeave(elem, done){//页面离开    
        if($store.getters.isRouterBack === null){
            done();
        } else {
            $(elem).css({
            	transform: "translate(0, 0)",
            	transition: "transform 300ms"
            }).one("transitionend", function(){ done() });
            
            setTimeout(function(transX){
            	elem.style.transform = `translate(${transX}%, 0)`;
            }, 10, ($store.getters.isRouterBack ? 100 : -100));//如果是返回则，往右移动，打开新页面时才往左移动
        }
    }
    
    onMounted(() => {
        if(!window.onresize){
        	window.onresize = function(){
        		//【手机端】以屏幕 360x640 的字体 20 像素为基准，【电脑端】以 1366x768 为基准
        		let fs_px1 = 0;
        		if (navigator.userAgent.lastIndexOf("Mobile") >= 0){
        			fs_px1 = (window.innerWidth / 360) * 10;
        		} else {
        			fs_px1 = (window.innerWidth / 1366) * 20;
        		}
        		let fs_px2 = Math.round(fs_px1 / 10) * 10;//让它是 10 的倍数：
        		if(fs_px2 < 20){
        			fs_px2 = 20;
        		}
                window.pxOf1rem = fs_px2; //px of 1 rem。1rem有多少像素
        	    document.documentElement.style.fontSize = (fs_px2 + "px");
                document.documentElement.style.setProperty("--current-window-height", window.innerHeight + "px");
        		document.getElementById("xlttapp").style.minHeight = (window.innerHeight + "px");
        	}
        }
        window.onresize();
    });
</script>

<style>
#xlttapp {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fff;
  font-size: 0.8rem;
  overflow: hidden;
}
</style>
