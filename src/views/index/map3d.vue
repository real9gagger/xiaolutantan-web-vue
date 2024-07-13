<template>
    <div class="hi-cwh of-h">
        <div id="IndexMap3DBox" class="wh-f"></div>
        <map3d-control-vertical
            @positionlocation="onPositionSuccess"
            @restoreperspective="onRestorePerspective"
            @togglemaptype="onToggleMapType"
            @gotoaccount="onGotoMyAccount"
        />
        <map3d-info-window :lnglats="iwLnglats" :title="iwTitle" @placepins="OnMapPlacePins" />
        <div class="map3d-zoom-level-box">缩放&nbsp;{{mapZoomLevel}}级</div>
    </div>
</template>

<script setup name="IndexMap3D">
    import { ref, onMounted, onUnmounted, getCurrentInstance, nextTick } from "vue";
    import { useRouter } from "vue-router";
    import { combineCanalGeoJSON, getCanalPOIList } from "@/assets/data/canalGeo.js";
    import { getPolylineColorList, gcj02ToBD09, gcj02ToMapPoint } from "@/utils/maphelper.js";
    
    import map3dControlVertical from "@/components/map3dControlVertical.vue";
    import map3dInfoWindow from "@/components/map3dInfoWindow.vue";
    import bdMapStyleFor3D from "@/assets/json/bdMapStyleFor3D.json";
    import bdMapStyleForSatellite from "@/assets/json/bdMapStyleForSatellite.json";
    
    import publicAssets from "@/assets/data/publicAssets.js";
    
    /* mapVGL教程：https://mapv.baidu.com/gl/docs/index.html */
    
    let mapInstance = null; //非响应式变量
    let mapWmtsLayer = null; //第三方卫星地图图层
    
    //切换到天地图卫星图层。投影方式默认 EPSG:900913（又称 EPSG:3857）
    const TIAN_DITU_TILE_URL = "https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=[z]&TILEROW=[y]&TILECOL=[x]&tk=acd52d38214fe26fb2d0149f3ca5e19b";
    //默认视图
    const DEFAULT_VIEW_POINTS = [
        new BMapGL.Point(108.415365, 22.817497),
        new BMapGL.Point(109.375871, 21.592572)
    ];
    
    const $router = useRouter();
    const mapZoomLevel = ref(8); //当前地图缩放级别
    const iwLnglats = ref([]);
    const iwTitle = ref("");
    
    //还原默认视图
    function onRestorePerspective(){
        mapInstance.setViewport(DEFAULT_VIEW_POINTS);
    }
    
    //定位我的位置成功后
    function onPositionSuccess(res) {
        const iconSize = new BMapGL.Size(40, 40);
        const iconOptions = {
            anchor: new BMapGL.Size(iconSize.width / 2, iconSize.height)
        };
        const locMarker = new BMapGL.Marker(res.locationPoint, {
            title: res.locationAddress,
            icon: new BMapGL.Icon(publicAssets.iconMyLocation, iconSize, iconOptions),
            isLocMarker: true
        });
        
        clearMapOverlays("isLocMarker");
        
        mapInstance.addOverlay(locMarker);
        mapInstance.panTo(res.locationPoint);
        
        iwTitle.value = res.locationAddress;
        iwLnglats.value = [res.locationPoint];
    }
    
    //接换成卫星地图或普通地图
    function onToggleMapType(isSatelliteMapType){
        if(isSatelliteMapType){
            mapWmtsLayer = new BMapGL.XYZLayer({
                useThumbData: true,
                tileUrlTemplate: TIAN_DITU_TILE_URL,
                zIndex: 0,
                maxZoom: 23,
                minZoom: 3
            });
            mapInstance.addTileLayer(mapWmtsLayer);
            mapInstance.setMaxZoom(18);
            mapInstance.setMapStyleV2(bdMapStyleForSatellite);
        } else {
            if(mapWmtsLayer){
                mapInstance.removeTileLayer(mapWmtsLayer);
                mapInstance.setMaxZoom(23);
                mapInstance.setMapStyleV2(bdMapStyleFor3D);
                mapWmtsLayer = null;
            }
        }
        
        buildCanalPOI(isSatelliteMapType);
    }
    
    //转到我的账户
    function onGotoMyAccount(){
        const isLogin = false;
        if(!isLogin){
            $router.push("/login");
        }
    }
    
    //监听地图缩放
    function onMapZoomInOut(evt){
        const bdmap = (evt?.target || mapInstance);
        mapZoomLevel.value = Math.floor(bdmap.getZoom());
    }
    
    //监听地图点击
    function onMapClicked(evt){        
        //如果仅仅只是点击我的位置标记，则不隐藏
        if(!evt.overlay){
            iwTitle.value = null;
            iwLnglats.value = null;
        } else if(evt.overlay._config.isLocMarker || evt.overlay._config.isPlyhPOI){
            iwTitle.value = evt.overlay._config.title;
            iwLnglats.value = [evt.overlay.latLng];
        }
    }
    
    //定位到某个地点获取某个地区
    function OnMapPlacePins(arg){
        if(arg.length === 1){
            mapInstance.flyTo(arg[0], 17);
        }
    }
    
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
        
        mapInstance.setViewport(DEFAULT_VIEW_POINTS);
        mapInstance.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        mapInstance.enableResizeOnCenter(); //开启图区resize中心点不变
        mapInstance.enableRotateGestures(); //是否允许通过手势倾斜地图
        mapInstance.setHeading(0); //旋转角度
        mapInstance.setTilt(0); //倾斜角度
        mapInstance.setMapStyleV2(bdMapStyleFor3D);
        mapInstance.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT, offset: new BMapGL.Size(15,25) })); //添加比例尺控件
        //2024年7月9日 弃用，改成自定义导航控件 mapInstance.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加缩放控件
        //2024年7月9日 弃用，改成自定义导航控件 mapInstance.addControl(new BMapGL.NavigationControl3D({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加导航控件
        mapInstance.addEventListener("zoomend", onMapZoomInOut);
        mapInstance.addEventListener("click", onMapClicked);
        
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
    function buildCanalPOI(isSatelliteMapType){
        const poiList = getCanalPOIList();
        const iconSize = new BMapGL.Size(90, 30);
        
        //先删除
        clearMapOverlays("isPlyhPOI");
        
        //再添加
        for(const vx of poiList){
            mapInstance.addOverlay(new BMapGL.Marker(gcj02ToMapPoint(vx.lngLat), {
                enableClicking: false,
                title: vx.title,
                icon: new BMapGL.Icon(publicAssets[!isSatelliteMapType ? vx.iconName1 : vx.iconName2], iconSize, {
                    anchor: new BMapGL.Size(iconSize.width * vx.iconAnchor.x, iconSize.height * vx.iconAnchor.y)
                }),
                isPlyhPOI: true
            }));
        }
    }
    
    //删除具有某个标识的一组覆盖物
    function clearMapOverlays(key, num){
        const olList = mapInstance.getOverlays();
        const groupKey = (key || "").toString();
        
        for(let idx = olList.length - 1; idx >= 0; idx--){
            if(olList[idx]._config[groupKey]){
               mapInstance.removeOverlay(olList[idx]);
            }
        }
    }
    
    onMounted(() => {
        nextTick(() => {
            buildBaiduMap();
            buildCanalLines();
            buildCanalPOI();
            onMapZoomInOut();
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
        mapWmtsLayer = null;
    });
</script>

<style scoped="scoped">
    .map3d-zoom-level-box{
        position: fixed;
        left: 0.75rem;
        bottom: 0.35rem;
        z-index: 88;
        font-size: 0.55rem;
        text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
        color: #000;
        text-align: center;
    }
</style>