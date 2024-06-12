<template>
    <div class="hi-cwh of-h">
        <div id="IndexMap3DBox" class="wh-f"></div>
    </div>
</template>

<script setup name="IndexMap3D">
    import { onMounted, onUnmounted, getCurrentInstance } from "vue";
    import { combineCanalGeoJSON } from "@/assets/data/canal_geo.js";
    import { getPolylineColorList } from "@/utils/maphelper.js";
    
    import bdMapStyle from "@/assets/json/bdMapStyleFor3D.json";
    
    /* mapVGL教程：https://mapv.baidu.com/gl/docs/index.html */
    
    let mapInstance = null; //非响应式变量
    
    function buildBaiduMap(){//创建百度地图
        //请确保已在 /piblic/index.html 中引入百度地图 JS API 脚本！
        mapInstance = new BMapGL.Map(document.getElementById("IndexMap3DBox"), {
            mapType: BMAP_NORMAL_MAP, //切换到地图 BMAP_SATELLITE_MAP（没有路网），BMAP_EARTH_MAP（有路网）
            maxZoom: 23
        });
        
        //地图样式参考代码：https://bj.bcebos.com/v1/mapopen/api-demos/js/mapStyle.js
        //地图样式参考文件：https://lbsyun.baidu.com/jsdemo.htm#lcustomStyle
        //使用手册：https://mapopen-pub-jsapi.bj.bcebos.com/jsapi/reference/jsapi_webgl_1_0.html
        //百度地图JSAPI WebGL v1.0类参考 https://mapopen-pub-jsapi.bj.bcebos.com/jsapi/reference/jsapi_webgl_1_0.html
        
        mapInstance.setViewport([ //默认视图款
            (new BMapGL.Point(108.415365, 22.817497)),
            (new BMapGL.Point(109.375871, 21.592572))
        ]);
        mapInstance.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        mapInstance.enableResizeOnCenter(); //开启图区resize中心点不变
        mapInstance.enableRotateGestures(); //是否允许通过手势倾斜地图
        //mapInstance.setHeading(180);
        //mapInstance.setTilt(75);
        mapInstance.setMapStyleV2(bdMapStyle);
        mapInstance.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT, offset: new BMapGL.Size(15,20) })); //添加比例尺控件
        mapInstance.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加缩放控件
        mapInstance.addControl(new BMapGL.NavigationControl3D({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加导航控件
        
        if(mapInstance.logoCtrl){ /* 隐藏百度地图 LOGO */
            $(mapInstance.logoCtrl._container).hide().addClass("bdMapLogo");
        }
        
        const vglView = new mapvgl.View({
            map: mapInstance
        });
        const lrLayer = new mapvgl.LineRainbowLayer({
            style: "normal", // road, arrow, normal
            width: 8,
            color: getPolylineColorList(0x00dddd, 0x1296db, 32),
            lineCap: "round",
            lineJoin: "round",
            antialias: true,
            data: [{
                geometry: {
                    type: "LineString",
                    coordinates: combineCanalGeoJSON(),
                }
            }]
        });
        
        vglView.addLayer(lrLayer);
    }
    
    onMounted(() => {
        buildBaiduMap();
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
</style>