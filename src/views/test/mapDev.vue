<template>
    <div class="wh-s bg-mc">
        <div id="testMapDevMapBox" class="map-dev-box"></div>
    </div>
</template>

<script setup name="TestMapDev">
    import { onMounted, onUnmounted, getCurrentInstance } from "vue";
    import { getCanalGeoJSON, combineCanalGeoJSON } from "@/assets/data/canalGeo.js";
    import { toBMapPoints } from "@/utils/maphelper.js";
    import axios from "axios";
    import bdMapStyle from "@/assets/json/bdMapStyle.json";
    import publicAssets from "@/assets/data/publicAssets.js";

    let mapInstance = null; //地图实例。单独放在外面，避免被 vue 响应化处理（避免添加太多 getter/setter 造成卡顿）。
    
    function buildBaiduMap(){//创建百度地图
        //请确保已在 /piblic/index.html 中引入百度地图 JS API 脚本！
        mapInstance = new BMapGL.Map(document.getElementById("testMapDevMapBox"), {
            mapType: BMAP_NORMAL_MAP, //切换到地图 BMAP_SATELLITE_MAP（没有路网），BMAP_EARTH_MAP（有路网）
            maxZoom: 23
        });
        
        //地图样式参考代码：https://bj.bcebos.com/v1/mapopen/api-demos/js/mapStyle.js
        //地图样式参考文件：https://lbsyun.baidu.com/jsdemo.htm#lcustomStyle
        //使用手册：https://mapopen-pub-jsapi.bj.bcebos.com/jsapi/reference/jsapi_webgl_1_0.html
        //百度地图JSAPI WebGL v1.0类参考 https://mapopen-pub-jsapi.bj.bcebos.com/jsapi/reference/jsapi_webgl_1_0.html
        mapInstance.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        mapInstance.enableResizeOnCenter(); //开启图区resize中心点不变
        //mapInstance.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT })); //添加比例尺控件
        //mapInstance.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加缩放控件
        //mapInstance.addControl(new BMapGL.NavigationControl3D({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));//添加导航控件
        mapInstance.setMapStyleV2(bdMapStyle);
        mapInstance.setViewport([ //默认视图款
            (new BMapGL.Point(108.415365, 22.817497)), //镇
            (new BMapGL.Point(109.375871, 21.592572))
            /* (new BMapGL.Point(108.170678, 23.149844)), //县
            (new BMapGL.Point(109.640205, 21.562765)) */
            /* (new BMapGL.Point(107.078087, 24.154377)), //市
            (new BMapGL.Point(110.108998, 21.483755)) */
        ]);
    }
    
    onMounted(() => {
        buildBaiduMap();
        
        /* axios.get(publicAssets.geojsonZhen).then(res => {
            console.log(res.data);
            const geolayer = new BMapGL.FillLayer({
                crs: "GCJ02", //设置默认坐标系，避免产生偏移
                enablePicked: true,
                autoSelect: false,
                border: true, //是否描边
                popEvent: false, //事件是否冒泡，默认true
                pickWidth: 10,
                pickHeight: 10,
                selectedColor: "#0cf",
                style: {
                    fillColor: "#43BA62",
                    fillOpacity: 0.3,
                    strokeColor: "#43BA62",
                    strokeWeight: 2, //border 必须为 true
                    strokeOpacity: 1
                },
                zIndex: 1003,
                minZoom: 7, // 设置图层显示的地图最小等级
                maxZoom: 21 // 设置图层显示的地图最大等级
            });
            geolayer.setData(res.data);
            mapInstance.addNormalLayer(geolayer);
        }).catch(err => {
        }); */
        
        /* mapInstance.addOverlay(new BMapGL.Polyline(toBMapPoints(combineCanalGeoJSON()), {
            strokeStyle: 'solid',
            strokeColor: "#1296db",//'linear-gradient(0deg, #00dddd, #1296db)',
            strokeWeight: 8,
            strokeOpacity: 1
        })); */
        
        const dddd = getCanalGeoJSON();
        mapInstance.addOverlay(new BMapGL.Polyline(toBMapPoints(dddd.upperSection), {
            strokeStyle: 'solid',
            strokeColor: "#00dddd",
            strokeWeight: 8,
            strokeOpacity: 1
        }));
        mapInstance.addOverlay(new BMapGL.Polyline(toBMapPoints(dddd.lowerSection), {
            strokeStyle: 'solid',
            strokeColor: "#0088db",
            strokeWeight: 8,
            strokeOpacity: 1
        }));
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
    .map-dev-box{
        width: 15rem;
        height: 15rem;
    }
    :deep(.anchorBL){display:none !important;}
</style>
