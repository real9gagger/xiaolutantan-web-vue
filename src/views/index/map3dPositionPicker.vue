<template>
    <div class="hi-cwh">
        <div id="positionPickerMapBox" class="wi-f" style="height:60vh"></div>
        <div class="mpp-my-location" :class="{'mpp-positionning-ani': isPositionning}" @click="onPositionMyLocation"><img :src="publicAssets.iconMapLocationPosition" class="wh-f" alt="定位到我的位置" /></div>
        <div class="mpp-pin-box">
            <img class="mpp-pin-icon" alt="地图中心点"
                :src="publicAssets.iconMapPositionPin" 
                :class="{'updown': mapPinUpDowning}" 
                @animationend="onImgAnimationEnd" />
            <span class="mpp-pin-shadow" :class="{'scaling': mapPinUpDowning}"><!-- 底部阴影 --></span>
        </div>
        <slide-search-panel scroller-id="searchResultsListBox">
            <div class="pd-rem5 ps-r">
                <img :src="!isSearchFocus ? publicAssets.iconSearchGrey : publicAssets.iconSearchGreen" class="ps-a po-t-c wh-1em" style="left:1.2rem" />
                <input type="search" maxlength="60" class="mpp-search-input" placeholder="搜索地点" @focus="onInputFocusOrBlur" @blur="onInputFocusOrBlur" />
            </div>
            <div v-if="isSearchFocus" class="fx-g1"><!-- 占位专用 --></div>
            <div v-else-if="!poiList" class="pd-1rem ta-c fx-g1">
                <img :src="publicAssets.imageLoadingGif" class="dp-ib wh-2rem" />
            </div>
            <div v-else-if="!poiList.length" class="pd-1rem ta-c fx-g1">
                <img :src="publicAssets.iconPoiNoResults" class="dp-ib wh-3rem" />
                <p class="mg-t-rem5 tc-cc">当前位置暂无数据</p>
            </div>
            <ul v-else class="pd-lr-rem5 fx-g1 of-a of-no-sb" id="searchResultsListBox">
                <li v-for="item,idx in poiList" :key="item.uid" class="mpp-poi-item" @click="onPoiItemSelected(idx)">
                    <p :class="{'tc-mc': poiIndex===idx}">{{item.title}}</p>
                    <p class="fs-rem6" :class="poiIndex===idx ? 'tc-g2': 'tc-99'">{{item.distance}} | {{item.address}}</p>
                    <img v-if="poiIndex===idx" :src="publicAssets.iconCheckV" class="mpp-poi-checked" />
                </li>
                <li class="pd-t-rem5 ta-c tc-aa fs-rem6">没有更多了~</li>
            </ul>
            <div v-show="!isSearchFocus" class="pd-rem5">
                <button class="btn-box" :class="{'disabled': !poiList?.length}" @click="onConfirm">确 定</button>
            </div>
        </slide-search-panel>
    </div>
</template>

<script setup name="IndexMap3DPositionPicker">
    import { nextTick, onMounted, onUnmounted, ref } from "vue";
    import { needDebounce } from "@/utils/cocohelper.js";
    import { getFriendlyDistance } from "@/utils/maphelper.js";
    import slideSearchPanel from "@/components/slideSearchPanel.vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    let mapInstance = null; //地图实例。单独放在外面，避免被 vue 响应化处理（避免添加太多 getter/setter 造成卡顿）。
    
    const mapPinUpDowning = ref(false);
    const isPositionning = ref(false); //是否正在定位
    const poiList = ref(null);
    const poiIndex = ref(0);
    const isSearchFocus = ref(false);
    
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
        mapInstance.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_TOP_LEFT, offset: new BMapGL.Size(10, 6) })); //添加比例尺控件
        mapInstance.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, offset: new BMapGL.Size(10, 10) }));//添加缩放控件
        mapInstance.centerAndZoom(new BMapGL.Point(108.95692720580574, 22.286438780735033), 8);
        mapInstance.addEventListener("dragend", onMapDragEnd);
    }
    function onMapDragEnd(evt){
        //console.log(evt)
        needDebounce(onGeocoderPoint, 800);
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
    function onGeocoderPoint(){
        const geocoder = new BMapGL.Geocoder();
        const centerPoint = mapInstance.getCenter();
        
        mapPinUpDowning.value = true;
        poiList.value = null;
        
        geocoder.getLocation(centerPoint, function(res){
            //console.log(res);
            poiList.value = (res?.surroundingPois || []).map(vx => ({
                uid: vx.uid,
                address: vx.address,
                title: vx.title,
                point: vx.point,
                distance: getFriendlyDistance(centerPoint, vx.point)
            }));
        }, {poiRadius: 1000, numPois: 30});
    }
    function onPoiItemSelected(idx){
        poiIndex.value = idx;
        mapInstance.panTo(poiList.value[idx].point);
    }
    function onConfirm(){
        
    }
    function onInputFocusOrBlur(evt){
        isSearchFocus.value = (evt.type === "focus");
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
        top: 30vh;
        transform: translate(-50%, -2.5rem);
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
        position: fixed;
        right: 0.35rem;
        top: 3.5rem;
        z-index: 88;
        width: 1.6rem;
        height: 1.6rem;
        padding: 0.25rem;
        background-color: #fff;
        box-shadow: 0 0 0.5rem 0 #ccc;
        border-radius: 50%;
        cursor: pointer;
    }
    .mpp-positionning-ani{
        animation: mcv-location-positionning-kf 1s ease infinite; /* 动画帧在控件 “map3dControlVertical” 里定义 */
    }
    
    .mpp-search-input{
        background-color: #f0f0f0;
        padding: 0.4rem 2rem;
        border-radius: 3rem;
        border: 0.1rem solid #f0f0f0;
    }
    .mpp-search-input:focus{
        border-color: var(--main-color);
    }
    .mpp-poi-item{
        padding: 0.5rem 0;
        border-bottom: 0.05rem solid #f0f0f0;
        position: relative;
        cursor: pointer;
    }
    .mpp-poi-item:active::before{
        content: "";
        display: block;
        position: absolute;
        inset: 0 -0.5rem 0 -0.5rem;
        background-color: #f0f0f0;
        z-index: -1;
    }
    .mpp-poi-checked{
        display: block;
        position: absolute;
        right: 0;
        top: calc(50% - 0.5rem);
        z-index: 1;
        width: 1rem;
        height: 1rem;
    }
    
    :deep(.anchorBL){display:none !important;}
</style>