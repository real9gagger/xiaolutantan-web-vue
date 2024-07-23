<template>
    <div>
        <div id="positionPickerMapBox" class="wi-f hi-cwh"></div>
        <a class="mpp-my-location" :class="{'mpp-positionning-ani': isPositionning}" @click="onPositionMyLocation"><img :src="publicAssets.iconMapLocationPosition" class="wh-f" alt="定位到我的位置" /></a>
        <div class="mpp-pin-box">
            <img class="mpp-pin-icon" alt="地图中心点"
                :src="publicAssets.iconMapPositionPin" 
                :class="{'updown': mapPinUpDowning}" 
                @animationend="onImgAnimationEnd" />
            <span class="mpp-pin-shadow" :class="{'scaling': mapPinUpDowning}"><!-- 底部阴影 --></span>
        </div>
    </div>
</template>

<script setup name="IndexMap3DPositionPicker">
    import { nextTick, onMounted, onUnmounted, ref } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    let mapInstance = null; //地图实例。单独放在外面，避免被 vue 响应化处理（避免添加太多 getter/setter 造成卡顿）。
    
    const mapPinUpDowning = ref(false);
    const isPositionning = ref(false); //是否正在定位
    
    function buildBaiduMap(){//创建百度地图
        //请确保已在 /piblic/index.html 中引入百度地图 JS API 脚本！
        mapInstance = new BMapGL.Map(document.getElementById("positionPickerMapBox"), {
            mapType: BMAP_NORMAL_MAP, //切换到地图 BMAP_SATELLITE_MAP（没有路网），BMAP_EARTH_MAP（有路网）
            maxZoom: 23,
            enableRotate: false, //是否允许地图旋转
            enableTilt: false, //是否允许地图倾斜
            enableRotateGestures: false, //是否允许通过手势旋转地图
            enableTiltGestures: false //是否允许通过手势倾斜地图
        });
        
        //地图样式参考代码：https://bj.bcebos.com/v1/mapopen/api-demos/js/mapStyle.js
        //地图样式参考文件：https://lbsyun.baidu.com/jsdemo.htm#lcustomStyle
        //使用手册：https://mapopen-pub-jsapi.bj.bcebos.com/jsapi/reference/jsapi_webgl_1_0.html
        //百度地图JSAPI WebGL v1.0类参考 https://mapopen-pub-jsapi.bj.bcebos.com/jsapi/reference/jsapi_webgl_1_0.html
        mapInstance.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        mapInstance.enableResizeOnCenter(); //开启图区resize中心点不变
        mapInstance.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, offset: new BMapGL.Size(15, 15) })); //添加比例尺控件
        mapInstance.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, offset: new BMapGL.Size(15, 45) }));//添加缩放控件
        mapInstance.setViewport([ //默认视图款
            (new BMapGL.Point(108.415365, 22.817497)),
            (new BMapGL.Point(109.375871, 21.592572))
        ]);
        mapInstance.addEventListener("dragend", onMapDragEnd);
    }
    function onMapDragEnd(evt){
        console.log(evt)
        needDebounce(function(){
            mapPinUpDowning.value = true;
        }, 500);
    }
    function onImgAnimationEnd(evt){
        mapPinUpDowning.value = false;
    }
    function onPositionMyLocation() {
        if (isPositionning.value) {
            return;
        } else {
            isPositionning.value = true;
        }
    
        const geolocation = new BMapGL.Geolocation();
        geolocation.getCurrentPosition(function(res) {
            const statusCode = geolocation.getStatus();
            if (statusCode === BMAP_STATUS_SUCCESS) {
                console.log(res)
                if(res.point){
                    
                } else {
                    appToast("定位失败：BMAP_STATUS_NULL_POINT");
                }
            } else if (statusCode === BMAP_STATUS_PERMISSION_DENIED) {
                appToast("定位失败：BMAP_STATUS_PERMISSION_DENIED");
            } else if (statusCode === BMAP_STATUS_TIMEOUT) {
                appToast("定位失败：BMAP_STATUS_TIMEOUT");
            } else {
                appToast("定位失败：BMAP_STATUS_UNKNOWN_LOCATION");
            }
            isPositionning.value = false;
        }, {
            enableHighAccuracy: true, //是否要求浏览器获取最佳效果，同浏览器定位接口参数。默认为false
            timeout: 15, //超时时间，单位为毫秒。默认为10秒
        });
    }
    
    onMounted(() => {
        nextTick(buildBaiduMap);
    });
    
    onUnmounted(() => {
        try {
            mapInstance && mapInstance.clearOverlays();
        } catch (ex){
            console.log("清理百度地图出错：", ex);
        }
        try {
            mapInstance && mapInstance.destroy();
        } catch (ex){
            console.log("销毁百度地图出错：", ex);
        }
        mapInstance = null;
    });
</script>

<style scoped="scoped">
    @keyframes mpp-pin-updown-kf{
    	0%{transform: translateY(0);}
    	50%{transform: translateY(-1rem);}
    	100%{transform: translateY(0);}
    }
    @keyframes mpp-pin-scale-kf{ /* PIN 阴影缩放 */
        0%{opacity:1;transform:scale(1);}
        50%{opacity:0.75;transform:scale(0.25);}
        100%{opacity:1;transform:scale(1);}
    }
    
    .mpp-pin-box{
        position: fixed;
        left: 50%;
        bottom: 50%;
        transform: translateX(-50%);
        z-index: 88;
    }
    .mpp-pin-icon{
        display: block;
        position: relative;
        z-index: 8;
    	width: 2.5rem;
    	height: 2.5rem;
    }
    .mpp-pin-icon.updown{
    	animation-fill-mode:forwards;
    	animation: mpp-pin-updown-kf 1s ease 0s 1 normal;
    }
    .mpp-pin-shadow{
        display: block;
        position: relative;
        z-index: 0;
        width: 1.3rem;
        height: 0.65rem;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
        margin: -0.4rem auto 0 auto;
    }
    .mpp-pin-shadow.scaling{
        animation-fill-mode:forwards;
        animation: mpp-pin-scale-kf 1s ease 0s 1 normal;
    }
    .mpp-my-location{
        display: block;
        position: fixed;
        right: 0.6rem;
        bottom: 6rem;
        z-index: 88;
        width: 1.6rem;
        height: 1.6rem;
        padding: 0.25rem;
        background-color: #fff;
        box-shadow: 0 0 0.5rem 0 #ccc;
        border-radius: 50%;
    }
    .mpp-positionning-ani{
        animation: mcv-location-positionning-kf 1s ease infinite; /* 动画帧在控件 “map3dControlVertical” 里定义 */
    }
    
    :deep(.anchorBL){display:none !important;}
</style>