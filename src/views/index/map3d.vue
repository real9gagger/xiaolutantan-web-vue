<template>
    <div class="hi-cwh of-h">
        <div id="IndexMap3DBox" class="wh-f"></div>
        <div class="map3d-zoom-level-box" :style="`min-width:${zlBoxWidth}px`">缩放&nbsp;{{mapZoomLevel}}级</div>
        <map3d-control-vertical
            @onshare="onClickShare"
            @onaboutcanal="onGotoAboutCanal"
            @positionlocation="onPositionSuccess"
            @restoreperspective="onRestorePerspective"
            @toggleregion="onShowOrHideRegion"
            @panoramicview="onPanoramicView"
            @gotoaccount="onGotoMyAccount"
            @togglecallout="buildSharePicture"
        />
        <map3d-info-window :lnglats="iwLnglats" :title="iwTitle" @placepins="OnMapPlacePins" />
        <map3d-share-picture-callout ref="mspcBox" />
        <page-share-panel v-model="isShowSharePanel" />
    </div>
</template>

<script setup name="IndexMap3D">
    import { ref, watch, onMounted, onUnmounted, getCurrentInstance, nextTick } from "vue";
    import { useStore } from "vuex";
    import { useRouter } from "vue-router";
    import { getUpperSectionLength, combineCanalGeoJSON, getCanalPOIList } from "@/assets/data/canalGeo.js";
    import { getPolylineColorList, gcj02ToBD09, gcj02ToMapPoint, getLnglatViewPort } from "@/utils/maphelper.js";
    import { administrativeRegion, canalDisplayMode, mapLayerType, appMainColor } from "@/assets/data/constants.js";
    import { needDebounce } from "@/utils/cocohelper.js";
    
    import axios from "axios";
    import ajaxRequest from "@/request/index.js";
    import myStorage from "@/utils/mystorage.js";
    import map3dControlVertical from "@/components/map3dControlVertical.vue";
    import map3dInfoWindow from "@/components/map3dInfoWindow.vue";
    import map3dSharePictureCallout from "@/components/map3dSharePictureCallout.vue";
    import pageSharePanel from "@/components/pageSharePanel.vue";
    import bdMapStyle from "@/assets/json/bdMapStyle.json";
    import bdMapStyleFor3D from "@/assets/json/bdMapStyleFor3D.json";
    import bdMapStyleForSatellite from "@/assets/json/bdMapStyleForSatellite.json";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    /* mapVGL教程：https://mapv.baidu.com/gl/docs/index.html */
    
    let mapInstance = null; //非响应式变量
    let mapWmtsLayer = null; //第三方卫星地图图层
    let mapAreaLayer = null; //地图周边城市图层
    let mapActivitingCallout = null; //当前被点击的气泡
    let mapIgnoreClicked = false; //是否忽略地图点击
    
    //切换到天地图卫星图层。投影方式默认 EPSG:900913（又称 EPSG:3857）
    const TIAN_DITU_TILE_URL = "https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=[z]&TILEROW=[y]&TILECOL=[x]&tk=acd52d38214fe26fb2d0149f3ca5e19b";
    //天地图，地形图瓦片图层URL
    const TIAN_DITU_TILE_TOPO = "https://t1.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=[z]&TILEROW=[y]&TILECOL=[x]&tk=acd52d38214fe26fb2d0149f3ca5e19b";
    //默认视图
    const DEFAULT_VIEW_POINTS = [
        new BMapGL.Point(108.415365, 22.817497),
        new BMapGL.Point(109.375871, 21.592572)
    ];
    
    const $store = useStore();
    const $router = useRouter();
    const $instance = getCurrentInstance();
    
    const mapZoomLevel = ref(8); //当前地图缩放级别
    const iwLnglats = ref([]);
    const iwTitle = ref("");
    const zlBoxWidth = ref(0);
    const isShowSharePanel = ref(false);
    
    //点击了分享
    function onClickShare(){
        isShowSharePanel.value = true;
    }
    
    //转到运河简介
    function onGotoAboutCanal(){
        $router.push("/aboutcanal");
    }
    
    //还原默认视图
    function onRestorePerspective(){
        clearMapOverlays("isLocMarker"); //顺便清理我的位置
        iwTitle.value = null;
        iwLnglats.value = null;
        mapInstance.setViewport(DEFAULT_VIEW_POINTS);
    }
    
    //定位我的位置成功后
    function onPositionSuccess(res) {
        const iconSize = new BMapGL.Size(60, 60);
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
    
    //切换成卫星地图或普通地图
    function onToggleMapType(arg0){
        if(mapWmtsLayer){
            mapInstance.removeTileLayer(mapWmtsLayer);
            mapWmtsLayer = null;
        }
        
        if(arg0){
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
            mapInstance.setMaxZoom(23);
            mapInstance.setMapStyleV2(bdMapStyleFor3D);
        }
        
        buildCanalPOI();
    }
    
    //切换成地形图或者极简地图
    function onToggleMapTopo(arg0){
        if(mapWmtsLayer){
            mapInstance.removeTileLayer(mapWmtsLayer);
            mapWmtsLayer = null;
        }
        
        if(arg0){
            mapWmtsLayer = new BMapGL.XYZLayer({
                useThumbData: true,
                tileUrlTemplate: TIAN_DITU_TILE_TOPO,
                zIndex: 0,
                maxZoom: 23,
                minZoom: 3
            });
            mapInstance.addTileLayer(mapWmtsLayer);
            mapInstance.setMaxZoom(15);
            mapInstance.setMapStyleV2(bdMapStyleForSatellite);
        } else {
            mapInstance.setMaxZoom(23);
            mapInstance.setMapStyleV2(bdMapStyle);
        }
        
        buildCanalPOI();
    }
    
    //地图展示设置
    function onShowOrHideRegion() {
        $router.push("/map3dsettings");
    }
    
    //转到全景景点
    function onPanoramicView(){
        $router.push("/panoramiclist");
    }
    
    //转到我的账户
    function onGotoMyAccount(){
        $router.push("/mine");
    }
    
    //监听地图缩放
    function onMapZoomInOut(evt){
        nextTick(() => {
            const bdmap = (evt?.target || mapInstance);
            zlBoxWidth.value = (+$(bdmap.container).children(".BMap_scaleCtrl").width() || 80);
            mapZoomLevel.value = Math.floor(bdmap.getZoom());
        });
    }
    
    //监听地图点击
    function onMapClicked(evt){
        //如果仅仅只是点击我的位置标记，则不隐藏
        //console.log(evt);
        if(!mapIgnoreClicked){
            if(!evt.overlay){
                iwTitle.value = null;
                iwLnglats.value = null;
            } else if(evt.overlay._config.isLocMarker || evt.overlay._config.isPlyhPOI){
                iwTitle.value = evt.overlay._config.title;
                iwLnglats.value = [evt.overlay.latLng];
            }
            
            //点击地图其他地方时重置！！！
            mapActivitingCallout = $instance.refs.mspcBox.setCalloutActiviting(mapActivitingCallout, false);
        }
    }
    
    //点击运河周边区域时触发事件（该事件执行后会继续支持地图点击事件）
    function onSurroundingAreaClicked(evt){
        const theItem = evt.value?.dataItem;
        if(theItem){
            iwTitle.value = theItem.properties.name;
            iwLnglats.value = getLnglatViewPort(theItem.geometry.coordinates[0]);
            mapIgnoreClicked = true;
            needDebounce(resetSomeData, 100);
        }
    }
    
    //点击用户分享的照片时触发
    function onSharePictureClicked(evt){
        const dat = evt.target.properties;
        
        mapIgnoreClicked = true;
        needDebounce(resetSomeData, 100);
        
        //数据量有点大，保存在临时存储里
        myStorage.onceObject("user_sharepic_infos_" + dat.id, dat);
        $router.push("/map3ddetails?sid=" + dat.id);

        mapActivitingCallout = $instance.refs.mspcBox.setCalloutActiviting(mapActivitingCallout, false);
        mapActivitingCallout = $instance.refs.mspcBox.setCalloutActiviting(evt.target.div.firstChild, true);
    }
    
    //重置一些数据
    function resetSomeData(){
        mapIgnoreClicked = false;
    }
    
    //定位到某个地点获取某个地区
    function OnMapPlacePins(arg){
        if(arg.length === 1){
            mapInstance.flyTo(arg[0], 17);
        } else if(arg.length >= 2){//缩放视野到对应的周边区域
            mapInstance.setViewport(arg.map(gcj02ToMapPoint));
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
            $(mapInstance.logoCtrl._container).addClass("bdMapLogo");
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
        
        //先清空
        clearMapOverlays("isPlyhLine");
        
        const cdt = $store.getters.canalDisplayType;
        if(cdt === canalDisplayMode.NOT_DISPLAY){ //不显示运河
            return;
        }
        
        const canalPoints = combineCanalGeoJSON().map(gcj02ToMapPoint);
        const lineWidth = 6;
        
        //用作边框覆盖物！！！
        mapInstance.addOverlay(new BMapGL.Polyline(canalPoints, {
            strokeStyle: "solid",
            strokeColor: "#fff",
            strokeWeight: lineWidth + 4,
            strokeOpacity: 1,
            enableClicking: false,
            isPlyhLine: true
        }));
        
        if(cdt === canalDisplayMode.NORMAL_DISPLAY){//单段显示
            const lgColors = getPolylineColorList(0x00dddd, 0x1296db, canalPoints.length - 1); //渐变色列表
            //绘制渐变运河线段
            for(let k = 0; k < lgColors.length; k++){
                mapInstance.addOverlay(new BMapGL.Polyline([canalPoints[k], canalPoints[k + 1]], {
                    strokeStyle: "solid",
                    strokeColor: lgColors[k],
                    strokeWeight: lineWidth,
                    strokeOpacity: 1,
                    enableClicking: false,
                    isPlyhLine: true
                }));
            }
        } else {//分两段显示：上段为平陆运河，下段为钦江
            const usLength = getUpperSectionLength();
            mapInstance.addOverlay(new BMapGL.Polyline(canalPoints.slice(0, usLength), {
                strokeStyle: "solid",
                strokeColor: "#00dddd",
                strokeWeight: lineWidth,
                strokeOpacity: 1,
                enableClicking: false,
                isPlyhLine: true
            }));
            mapInstance.addOverlay(new BMapGL.Polyline(canalPoints.slice(usLength - 1), {
                strokeStyle: "solid",
                strokeColor: "#1296db",
                strokeWeight: lineWidth,
                strokeOpacity: 1,
                enableClicking: false,
                isPlyhLine: true
            }));
        }
    }
    
    //绘制运河周边兴趣点
    function buildCanalPOI(){
        
        //先删除
        clearMapOverlays("isPlyhPOI");
        
        //如果不显示运河，运河周边兴趣点也不必显示
        if($store.getters.canalDisplayType === canalDisplayMode.NOT_DISPLAY){
            return;
        }
        
        const poiList = getCanalPOIList();
        const iconSize = new BMapGL.Size(90, 30);
        const isSatelliteMap = ($store.getters.mapLayerType === mapLayerType.SATELLITE);
        
        //再添加
        for(const vx of poiList){
            mapInstance.addOverlay(new BMapGL.Marker(gcj02ToMapPoint(vx.lngLat), {
                enableClicking: false,
                title: vx.title,
                icon: new BMapGL.Icon(publicAssets[!isSatelliteMap ? vx.iconName1 : vx.iconName2], iconSize, {
                    anchor: new BMapGL.Size(iconSize.width * vx.iconAnchor.x, iconSize.height * vx.iconAnchor.y)
                }),
                isPlyhPOI: true
            }));
        }
    }
    
    //绘制地图周边区域
    function buildMapSurroundingArea(){
        const mat = $store.getters.mapAdministrativeType;
        const assetsUrl = 
            (mat === administrativeRegion.REGION_SHI ? publicAssets.geojsonShi : 
            (mat === administrativeRegion.REGION_XIAN ? publicAssets.geojsonXian : 
            (mat === administrativeRegion.REGION_ZHEN ? publicAssets.geojsonZhen : null
        )));
        
        if(mapAreaLayer){
            mapInstance.removeNormalLayer(mapAreaLayer);
            mapAreaLayer = null;
        }
        
        if(assetsUrl){
            axios.get(assetsUrl).then(res => {
                mapAreaLayer = new BMapGL.FillLayer({
                    crs: "GCJ02", //设置默认坐标系，避免产生偏移
                    enablePicked: true,
                    autoSelect: false,
                    border: true, //是否描边
                    popEvent: false, //事件是否冒泡，默认true
                    pickWidth: 20,
                    pickHeight: 20,
                    selectedColor: "#f00",
                    style: {
                        fillColor: appMainColor,
                        fillOpacity: 0.15,
                        strokeColor: appMainColor,
                        strokeWeight: 2, //border 必须为 true
                        strokeOpacity: 1
                    },
                    zIndex: 1000,
                    minZoom: 3, // 设置图层显示的地图最小等级
                    maxZoom: 23, // 设置图层显示的地图最大等级
                    data: res.data //GeoJSON 数据
                });
                mapAreaLayer.addEventListener("click", onSurroundingAreaClicked);
                mapInstance.addNormalLayer(mapAreaLayer);
                mapInstance.setViewport(res.data.viewport.map(gcj02ToMapPoint));
            }).catch(err => {
                appToast(err.message);
            });
        } else {
            mapInstance.setViewport(DEFAULT_VIEW_POINTS);
        }
    }
    
    //绘制用户分享的图片
    function buildSharePicture(isShow){
        
        //先清除，在添加！
        clearMapOverlays("isSharePicture");
        
        if(!isShow){
            return;
        }
        
        //2024年7月16日，获取用户分享的照片
        ajaxRequest("getUserPostList").then(res1 => {
            if(!res1 || !res1.length){
                return !appToast("还没有用户分享过照片~");
            }
            
            let isSetZ = false;
            let nth = 1;
            
            //经纬度越高（越往北），层级越小
            res1.sort(function(v1, v2){
                return (v1.latitude > v2.latitude ? -1 : 1);
            });
            
            for(const item of res1){
                if(item.status === 1 && item.pictureList?.length){//有效和有图片的才显示
                    const customOverlay = new BMapGL.CustomOverlay($instance.refs.mspcBox.buildCalloutHTML, {
                        point: gcj02ToMapPoint([item.longitude, item.latitude]),
                        properties: item,
                        zIndex: nth++,
                    });
                    mapInstance.addOverlay(customOverlay);
                    customOverlay._config = { isSharePicture: true };
                    customOverlay.addEventListener("click", onSharePictureClicked);
                    
                    //2024年9月5日 处理由于父元素Z层级太低，导致偶尔无法点击照片气泡的问题
                    if(!isSetZ){
                        isSetZ = true;
                        $(customOverlay.domElement).parent().css("z-index", 8888);
                    }
                }
            }
        });
    }
    
    //删除具有某个标识的一组覆盖物
    function clearMapOverlays(groupKey){
        const olList = mapInstance.getOverlays();
        
        //倒序遍历
        for(let idx = olList.length - 1; idx >= 0; idx--){
            if(olList[idx]._config[groupKey]){
               mapInstance.removeOverlay(olList[idx]);
            }
        }
    }
    
    //更新地图展示设置时，重新绘制地图某些东西
    watch(() => $store.getters.mapAdministrativeType, function(newVal){
        buildMapSurroundingArea();
        iwTitle.value = null;
        iwLnglats.value = null;
    });
    //更新地图展示设置时，重新绘制地图某些东西
    watch(() => $store.getters.canalDisplayType, function(){
        buildCanalLines();
        buildCanalPOI();
        iwTitle.value = null;
        iwLnglats.value = null;
    });
    //更新地图类型，重绘地图
    watch(() => $store.getters.mapLayerType, function(newVal){
        switch(newVal){
            case mapLayerType.MINIMALISM: onToggleMapTopo(false); break;
            case mapLayerType.TOPOGRAPHIC: onToggleMapTopo(true); break;
            case mapLayerType.SATELLITE: onToggleMapType(true); break;
            default: onToggleMapType(false); break;
        }
    });
    
    //用户发布啦新帖子！重新加载数据并更新视图！
    watch(() => $store.getters.thereAreNewPostsTs, buildSharePicture);
    
    onMounted(() => {
        nextTick(() => {
            buildBaiduMap();
            buildCanalLines();
            buildCanalPOI();
            onMapZoomInOut();
            buildSharePicture(true);
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
        mapAreaLayer = null;
        mapActivitingCallout = null;
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
    :deep(.bdMapLogo){
        display: none !important;
    }
</style>