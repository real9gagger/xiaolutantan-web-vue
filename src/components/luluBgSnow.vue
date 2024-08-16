<template>
    <div class="lbs-ani-container">
        <template v-if="snowList.length >= snowCount">
            <span v-for="item in snowList" :key="item.id" :data-idx="item.id" class="lbs-snow-flower" :style="item.css" @transitionend="onSnowTransitionEnd"></span>
        </template>
    </div>
</template>

<script setup name="LuluBgSnow">
    /*
        2024年8月15日 带动画的气泡背景效果图 
        参见：https://devdevout.com/css/css-animated-backgrounds，页面内搜索 “One element CSS Snow”
    */
   
    import { getCurrentInstance, onMounted, reactive, ref } from "vue";
    
    const $instance = getCurrentInstance();
    const snowList = reactive([]);
    const snowCount = 100;
    const boxWiHi = [0, 0];
    
    //过渡结束时，重新下雪
    function onSnowTransitionEnd(evt){
        const idx = +evt.target.getAttribute("data-idx") || 0;
        
        snowList[idx] = createOneSnow(idx, false);
        
        setTimeout(startSnowFall, 50, idx);
    }
    
    //开始下雪
    function startSnowFall(idx){
        let start = (idx >= 0 ? idx : 0);
        let end = (idx >= 0 ? (idx + 1) : snowCount);
        let vx = null;
        
        for(; start < end; start++){
            vx = snowList[start];
            vx.css = `transition:transform ${vx.dr}s linear 0s;transform:translate(${vx.tx}px, ${boxWiHi[1]}px) scale(${vx.sc / 2});opacity:${vx.op}`;
        }
    }
    
    //创建一颗雪花
    function createOneSnow(idx, isFirst){
        const tx = Math.round(boxWiHi[0] * Math.random());
        const ty = (isFirst ? Math.round(boxWiHi[1] * Math.random()) : -20);
        const sc = Math.random() + 0.5 + (idx % 2);
        const op = Math.random() * 0.5 + 0.5;
        const dr = Math.random() * 5 + 0.5 ;
        
        return {
            id: idx,
            tx: tx,
            sc: sc,
            op: op,
            dr: dr,
            css: `transform:translate(${tx}px, ${ty}px) scale(${sc});opacity:${op}`
        };
    }
    
    onMounted(() => {
        boxWiHi[0] = $instance.proxy.$el.clientWidth;
        boxWiHi[1] = $instance.proxy.$el.clientHeight + 50;
        
        for(let i = 0; i < snowCount; i++){
            snowList.push(createOneSnow(i, true));
        }
        
        setTimeout(startSnowFall, 50, -1);
    });
</script>

<style>
    .lbs-ani-container {
        height: 100%;
        background-image: linear-gradient(180deg, #123 30%, #667);
        overflow: hidden;
        position: relative;
    }
    .lbs-snow-flower{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 50%;
        background-color: white;
        filter: blur(0.05rem);
    }
</style>