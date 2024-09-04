<template>
    <div class="lbb-ani-container">
        <canvas key="CV01"></canvas>
        <canvas key="CV02"></canvas>
        <canvas key="CV03"></canvas>
    </div>
</template>

<script setup name="LuluBgBubble">
    /* 
        2024年8月15日 带动画的气泡背景效果图 
        参见：https://devdevout.com/css/css-animated-backgrounds，页面内搜索 “Canva moving background effect”
    */
    import { getCurrentInstance, onMounted, onUnmounted } from "vue";
    
    const $instance = getCurrentInstance();
    let timerID = 0;

    onMounted(() => setTimeout(() => {
        const canvasList = $($instance.proxy.$el).children("canvas");
        const config = {
            circle: {
                amount: 18,
                layer: 3,
                color: [157, 97, 207],
                alpha: 0.3
            },
            line: {
                amount: 18,
                layer: 3,
                color: [255, 255, 255],
                alpha: 0.3
            },
            speed: 0.5,
            angle: 20
        };
        const bctx0 = canvasList[0].getContext("2d");
        const fctx1 = canvasList[1].getContext("2d");
        const fctx2 = canvasList[2].getContext("2d");
        const wWidth = $instance.proxy.$el.clientWidth;
        const wHeight = $instance.proxy.$el.clientHeight;
        const sinVal = Math.sin(config.angle / 180 * Math.PI);
        const cosVal = Math.cos(config.angle / 180 * Math.PI);
        const circles = [];
        const lines = [];
        
        const createAF = function(callback){
            if(timerID < 0){
                return; //负数表示页面已关闭，因此不必再绘制动画！
            }
            
            if(window.requestAnimationFrame){
                window.cancelAnimationFrame(timerID);
                timerID = window.requestAnimationFrame(callback);
            } else if(window.mozRequestAnimationFrame){
                window.mozCancelAnimationFrame(timerID);
                timerID = window.mozRequestAnimationFrame(callback);
            } else if(window.webkitRequestAnimationFrame){
                window.webkitCancelAnimationFrame(timerID);
                timerID = window.webkitRequestAnimationFrame(callback);
            } else if(window.msRequestAnimationFrame){
                window.msCancelAnimationFrame(timerID);
                timerID = window.msRequestAnimationFrame(callback);
            } else if(window.oRequestAnimationFrame){
                window.oCancelAnimationFrame(timerID);
                timerID = window.oRequestAnimationFrame(callback);
            } else {
                clearTimeout(timerID);
                timerID = setTimeout(callback, 20);
            }
        };
        const drawCircle = function(x, y, radius, color, alpha) {
            const gradient = fctx1.createRadialGradient(x, y, radius, x, y, 0);
            
            gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha - 0.1})`);
            fctx1.beginPath();
            fctx1.arc(x, y, radius, 0, Math.PI * 2, true);
            fctx1.fillStyle = gradient;
            fctx1.fill();
        };
        const drawLine = function(x, y, width, color, alpha) {
            const endX = x + sinVal * width;
            const endY = y - cosVal * width;
            const gradient = fctx2.createLinearGradient(x, y, endX, endY);
            
            gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha - 0.1})`);
            fctx2.beginPath();
            fctx2.moveTo(x, y);
            fctx2.lineTo(endX, endY);
            fctx2.lineWidth = 3;
            fctx2.lineCap = "round";
            fctx2.strokeStyle = gradient;
            fctx2.stroke();
        };
        const drawBackground = function() {
            const gradient = [
                bctx0.createRadialGradient(wWidth * 0.3, wHeight * 0.1, 0, wWidth * 0.3, wHeight * 0.1, wWidth * 0.9),
                bctx0.createRadialGradient(wWidth * 0.1, wHeight * 0.1, 0, wWidth * 0.3, wHeight * 0.1, wWidth * 1.0),
                bctx0.createRadialGradient(wWidth * 0.1, wHeight * 0.5, 0, wWidth * 0.1, wHeight * 0.5, wWidth * 0.5)
            ];

            gradient[0].addColorStop(0, "rgb(0, 26, 77)");
            gradient[0].addColorStop(1, "transparent");
            
            bctx0.clearRect(0, 0, wWidth, wHeight);
            bctx0.translate(wWidth, 0);
            bctx0.scale(-1, 1);
            bctx0.beginPath();
            bctx0.fillStyle = gradient[0];
            bctx0.fillRect(0, 0, wWidth, wHeight);

            gradient[1].addColorStop(0, "rgb(0, 150, 240)");
            gradient[1].addColorStop(0.8, "transparent");

            bctx0.translate(wWidth, 0);
            bctx0.scale(-1, 1);
            bctx0.beginPath();
            bctx0.fillStyle = gradient[1];
            bctx0.fillRect(0, 0, wWidth, wHeight);
            
            gradient[2].addColorStop(0, "rgb(40, 20, 105)");
            gradient[2].addColorStop(1, "transparent");

            bctx0.beginPath();
            bctx0.fillStyle = gradient[2];
            bctx0.fillRect(0, 0, wWidth, wHeight);
        };
        const startAnimate = function() {
            fctx1.clearRect(0, 0, wWidth, wHeight);
            for (let i = 0, len = circles.length; i < len; i++) {
                let item = circles[i],
                    px = item.x,
                    py = item.y;
                if (px > wWidth + item.radius) {
                    px = -item.radius;
                } else if (px < -item.radius) {
                    px = wWidth + item.radius
                } else {
                    px += sinVal * item.speed;
                }
                if (py > wHeight + item.radius) {
                    py = -item.radius;
                } else if (py < -item.radius) {
                    py = wHeight + item.radius;
                } else {
                    py -= cosVal * item.speed;
                }
                item.x = px;
                item.y = py;
                drawCircle(item.x, item.y, item.radius, item.color, item.alpha);
            }
            
            fctx2.clearRect(0, 0, wWidth, wHeight);
            for (let j = 0, len = lines.length; j < len; j++) {
                let item = lines[j],
                    px = item.x,
                    py = item.y;
                if (px > wWidth + item.width * sinVal) {
                    px = -item.width * sinVal;
                } else if (px < -item.width * sinVal) {
                    px = wWidth + item.width * sinVal;
                } else {
                    px += sinVal * item.speed;
                }
                if (py > wHeight + item.width * cosVal) {
                    py = -item.width * cosVal;
                } else if (py < -item.width * cosVal) {
                    py = wHeight + item.width * cosVal;
                } else {
                    py -= cosVal * item.speed;
                }
                item.x = px;
                item.y = py;
                drawLine(item.x, item.y, item.width, item.color, item.alpha);
            }

            createAF(startAnimate);
        };
        const createItems = function() {
            circles.splice(0);
            lines.splice(0);
            
            if (config.circle.amount > 0 && config.circle.layer > 0) {
                for (let i = 0, z = config.circle.amount / config.circle.layer; i < z; i++) {
                    for (let j = 0; j < config.circle.layer; j++) {
                        circles.push({
                            x: Math.random() * wWidth,
                            y: Math.random() * wHeight,
                            radius: Math.random() * (20 + j * 5) + (20 + j * 5),
                            color: config.circle.color,
                            alpha: Math.random() * 0.2 + (config.circle.alpha - j * 0.1),
                            speed: config.speed * (1 + j * 0.5)
                        });
                    }
                }
            }
            
            if (config.line.amount > 0 && config.line.layer > 0) {
                for (let m = 0, z = config.line.amount / config.line.layer; m < z; m++) {
                    for (let n = 0; n < config.line.layer; n++) {
                        lines.push({
                            x: Math.random() * wWidth,
                            y: Math.random() * wHeight,
                            width: Math.random() * (20 + n * 5) + (20 + n * 5),
                            color: config.line.color,
                            alpha: Math.random() * 0.2 + (config.line.alpha - n * 0.1),
                            speed: config.speed * (1 + n * 0.5)
                        });
                    }
                }
            }
        };
        
        canvasList.each(function(){
            this.width = wWidth;
            this.height = wHeight;
        });
        
        createItems();
        drawBackground();
        createAF(startAnimate);
    }, 200));
    
    onUnmounted(() => {
        if(window.cancelAnimationFrame){
            window.cancelAnimationFrame(timerID);
        } else if(window.mozCancelAnimationFrame){
            window.mozCancelAnimationFrame(timerID);
        } else if(window.webkitCancelAnimationFrame){
            window.webkitCancelAnimationFrame(timerID);
        } else if(window.msCancelAnimationFrame){
            window.msCancelAnimationFrame(timerID);
        } else if(window.oCancelAnimationFrame){
            window.oCancelAnimationFrame(timerID);
        } else {
            clearTimeout(timerID);
        }
        
        timerID = -8888; //负数表示页面已关闭
    });
</script>

<style>
    .lbb-ani-container {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: rgb(0, 26, 77);
    }

    .lbb-ani-container > canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
    }
</style>