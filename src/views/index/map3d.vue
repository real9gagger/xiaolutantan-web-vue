<template>
    <div class="hi-cwh of-h">
        <div id="IndexMap3DBox" class="wh-f"></div>
        <map3d-control-vertical />
    </div>
</template>

<script setup name="IndexMap3D">
    import { onMounted, onUnmounted, getCurrentInstance, nextTick } from "vue";
    import { combineCanalGeoJSON, getCanalPOIList } from "@/assets/data/canalGeo.js";
    import { getPolylineColorList, gcj02ToBD09, gcj02ToMapPoint } from "@/utils/maphelper.js";
    
    import map3dControlVertical from "@/components/map3dControlVertical.vue";
    import bdMapStyleFor3D from "@/assets/json/bdMapStyleFor3D.json";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    /* mapVGL教程：https://mapv.baidu.com/gl/docs/index.html */
    
    let mapInstance = null; //非响应式变量
    
    //创建百度地图
    function buildBaiduMap(){
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
        mapInstance.setHeading(0); //旋转角度
        mapInstance.setTilt(0); //倾斜角度
        mapInstance.setMapStyleV2(bdMapStyleFor3D);
        mapInstance.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT, offset: new BMapGL.Size(15,20) })); //添加比例尺控件
        //2024年7月9日 弃用，改成自定义导航控件 mapInstance.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加缩放控件
        //2024年7月9日 弃用，改成自定义导航控件 mapInstance.addControl(new BMapGL.NavigationControl3D({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加导航控件
        
        if(mapInstance.logoCtrl){ /* 隐藏百度地图 LOGO */
            $(mapInstance.logoCtrl._container).hide().addClass("bdMapLogo");
        }
    }
    
    //绘制运河线段：渐变的，带白色边框的
    function buildCanalLines(){
        
        /* 2024年6月12日，这种方式可实现渐变，但带有灰色边框，弃用 const vglView = new mapvgl.View({
            map: mapInstance
        });
        const lrLayer = new mapvgl.LineRainbowLayer({
            style: "normal", // road, arrow, normal
            width: 6,
            color: getPolylineColorList(0x00dddd, 0x1296db, 32),
            lineCap: "round",
            lineJoin: "round",
            antialias: true,
            data: [{
                type:"Feature",
                geometry: {
                    type: "LineString",
                    coordinates: combineCanalGeoJSON().map(gcj02ToBD09),
                }
            }],
            renderOrder: 1
        });
        vglView.addLayer(lrLayer); */
        
        /* 2024年6月12日 这种方式无法实现渐变，弃用。 const lineLayer = new BMapGL.LineLayer({
            crs: "GCJ02",
            enablePicked: false,
            autoSelect: false,
            popEvent: false, //事件是否冒泡，默认true
            style: {
                borderColor: "#fff",
                borderWeight: 2,
                strokeWeight: 6,
                strokeStyle: "solid",
                strokeColor: "#fff", //["match", ["get", "name"], "运河地理线段", "linear-gradient(0deg, #f00, #00f)", "#0ff"],
                strokeOpacity: 1,
                strokeLineCap: "round",
                strokeLineJoin: "round",
            },
            zIndex: 10
        });
        lineLayer.setData({
            type: "Feature",
            properties: {
                name: "运河地理线段"
            },
            geometry: {
                type: "LineString",
                coordinates: combineCanalGeoJSON(),
            }
        });
        mapInstance.addNormalLayer(lineLayer); */
        
        const canalPoints = combineCanalGeoJSON().map(gcj02ToMapPoint);
        
        const lineWidth = 6;
        const bgPolyline = new BMapGL.Polyline(canalPoints, {
            strokeStyle: "solid",
            strokeColor: "#fff",
            strokeWeight: lineWidth + 4,
            strokeOpacity: 1,
            enableClicking: false
        });
        
        const lgColors = getPolylineColorList(0x00dddd, 0x1296db, canalPoints.length - 1); //渐变色列表
        
        mapInstance.addOverlay(bgPolyline); //用作边框覆盖物！！！
        
        //绘制渐变运河线段
        for(let k = 0; k < lgColors.length; k++){
            mapInstance.addOverlay(new BMapGL.Polyline([canalPoints[k], canalPoints[k + 1]], {
                strokeStyle: "solid",
                strokeColor: lgColors[k],
                strokeWeight: lineWidth,
                strokeOpacity: 1,
                enableClicking: false
            }));
        }
    }
    
    //绘制运河周边兴趣点
    function buildCanalPOI(){
        const poiList = getCanalPOIList();
        const iconSize = new BMapGL.Size(90, 30);
        
        for(const vx of poiList){
            mapInstance.addOverlay(new BMapGL.Marker(gcj02ToMapPoint(vx.lngLat), {
                enableClicking: false,
                title: vx.title,
                icon: new BMapGL.Icon(publicAssets[vx.iconName], iconSize, {
                    anchor: new BMapGL.Size(iconSize.width * vx.iconAnchor.x, iconSize.height * vx.iconAnchor.y)
                })
            }));
        }
    }
    
    onMounted(() => {
        nextTick(() => {
            buildBaiduMap();
            buildCanalLines();
            buildCanalPOI();
        });
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