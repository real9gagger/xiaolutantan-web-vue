<template>
    <div>
        <canvas :width="cvWidth" :height="cvHeight" ref="cvBox"></canvas>
        <button type="button" class="tie-btn-box" @click="onRedo">重做</button>
    </div>
</template>

<script setup name="TestInhalationEffect">
    import { getCurrentInstance, nextTick, onMounted } from "vue";
    
    const $instance = getCurrentInstance();
    const cvWidth = window.innerWidth;
    const cvHeight = window.innerHeight;
    const rectSize = 1; //小矩形尺寸像素
    const totalCols = Math.ceil(cvWidth / rectSize);
    const totalRows = Math.ceil(cvHeight / rectSize);
    const pointArray = [];
    
    let F4 = 0;
    let tryTimes = 0;
    
    function onRedo(){
        F4 = Math.hypot(cvWidth, cvHeight) * 100;
        tryTimes = 40;
        pointArray.splice(0);
        window.requestAnimationFrame(startDraw);
    }
    
    function startDraw(){
        const ctx = $instance.refs.cvBox.getContext("2d");
        const count = 1;
        
        if(!pointArray.length){
            for(let c = 0, r = 0; c < count; c++){
                const points = [];
                for(r = 0; r < count; r++){
                    points.push({
                        cc: c,
                        rr: r
                    });
                }
                pointArray.push(points);
            }
        }
        
        F4 += 50;
        
        for(const points of pointArray){
            for(const pp of points){
                //const dis = Math.hypot(totalCols - pp.cc, totalRows - pp.rr);
                //console.log(dis);
                //pp.cc = pp.cc + Math.round(F4 / (dis * dis));
                //pp.rr = pp.rr + Math.round(F4 / (dis * dis));
                
                pp.cc += 10;
                pp.rr += 10;
            }
        }
        
        console.log(pointArray);
        
        ctx.clearRect(0, 0, cvWidth, cvHeight);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        for(const points of pointArray){
            for(const pp of points){
                ctx.beginPath();
                ctx.moveTo(pp.cc, pp.rr);
                ctx.bezierCurveTo(pp.cc + 400, pp.rr, 400, 400, cvWidth, cvHeight);
                ctx.moveTo(pp.cc, pp.rr);
                ctx.bezierCurveTo(pp.rr, pp.cc + 400, 400, 400, cvWidth, cvHeight);
                ctx.stroke();
                //ctx.fillRect(pp.cc * rectSize, pp.rr * rectSize, rectSize, rectSize);
            }
        }
        
        if(--tryTimes > 0){
           window.requestAnimationFrame(startDraw);
        }
    }
    
    onMounted(() => {
        nextTick(onRedo);
    });
</script>

<style scoped="scoped">
    .tie-btn-box{
        display: block;
        position: fixed;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 1;
        border: 0;
        padding: 0.25rem 1rem;
    }
</style>