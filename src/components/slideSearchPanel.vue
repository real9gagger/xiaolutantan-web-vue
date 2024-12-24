<template>
    <div class="ssp-search-panel" :style="`height:${panelHeight}%;cursor:${cursorType}`"
        @touchstart="onPanelTouchStart"
        @touchmove="onPanelTouchMove"
        @touchend="onPanelTouchEnd"
        @touchcancel="onPanelTouchEnd"
        @transitionend="onPanelTransitionEnd"
        @mousedown="onPanelTouchStart"
        @mousemove="onPanelTouchMove"
        @mouseup="onPanelTouchEnd"
        @mouseleave="onPanelTouchEnd">
        <div class="pd-rem5 ps-r fx-hc">
            <img :src="isSearchFocus ? publicAssets.iconSearchGreen : publicAssets.iconSearchGrey" alt="搜索图标" class="ps-a po-t-c wh-1rem" style="left:1.2rem" />
            <input v-model="searchKeywords" type="search" maxlength="60" class="ssp-search-input" placeholder="搜索地点" @focus="onInputFocusOrBlur" @blur="onInputFocusOrBlur" @keydown.enter="onInputKeydownEnter" />
            <img v-show="!isSearchFocus" :src="publicAssets.iconMapRestoreGrey" alt="还原地图视图" class="ssp-my-location" @click="onMapZoomRestore" />
            <img v-show="!isSearchFocus" :src="publicAssets.iconUpOrDown" alt="面板展开或收起" class="ssp-my-location" @click="onPanelUpOrDown" />
            <img v-show="!isSearchFocus" :src="isPositionning ? publicAssets.iconMapLocationPosition : publicAssets.iconMapLocationGrey" alt="定位到我的位置" class="ssp-my-location" :class="{'positionning': isPositionning}" @click="onPositionMyLocation" />
            <a v-show="!isSearchFocus" class="ssp-btn-done" :class="{'disabled': !poiList?.length}" @click="onSelectedConfirm">完成</a>
        </div>

        <div v-if="isSearchFocus" class="fx-g1 pd-lr-rem5">
            <p class="tc-66">热门地点</p>
            <ul class="fx-r fx-wp mg-t-rem25">
                <li v-for="hk in hotKeywords" :key="hk" :data-hk="hk" class="ssp-hk-item" @click="onInputKeydownEnter">{{hk}}</li>
            </ul>
        </div>
        <div v-else-if="!poiList" class="pd-1rem ta-c fx-g1">
            <img :src="publicAssets.svgLoadingGif" alt="正在加载" draggable="false" class="dp-ib wh-2rem" />
            <p class="mg-t-rem5 tc-mc">正在加载…</p>
        </div>
        <div v-else-if="!poiList.length" class="pd-1rem ta-c fx-g1">
            <img :src="publicAssets.iconPoiNoResults" alt="暂无数据" draggable="false" class="dp-ib wh-3rem" />
            <p class="mg-t-rem5 tc-cc">当前位置暂无数据</p>
        </div>
        <ul v-else class="pd-lr-rem5 fx-g1 of-no-sb" :id="SCROLLER_BOX_ID" @scroll="onUlScroll">
            <li v-for="item,idx in poiList" :key="item.uid" class="ssp-poi-item" @click="onPoiItemSelected(idx)">
                <p :class="{'tc-mc': poiIndex===idx}">{{item.title}}</p>
                <p v-if="poiIndex===idx" class="fs-rem6 tc-g2">{{item.distance}} | {{item.address}} | <span class="tc-b0">近看</span></p>
                <p v-else class="fs-rem6 tc-99">{{item.distance}} | {{item.address}}</p>
                <img v-if="poiIndex===idx" :src="publicAssets.iconCheckV" alt="选中打勾" draggable="false" class="ssp-poi-checked" />
            </li>
            <li class="pd-tb-1rem ta-c tc-aa fs-rem6">{{isLoadingMore ? "正在加载更多…" : "没有更多了~"}}</li>
        </ul>
    </div>
</template>

<script setup name="SlideSearchPanel">
    import { ref, watch, onMounted, nextTick, onUnmounted } from "vue";
    import { getFriendlyDistance } from "@/utils/maphelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const emits = defineEmits([
        "itemselected",//item-selected
        "itemzoomin", //item-zoom-in
        "itemconfirm",//item-confirm
        "maprestore" //map-restore
    ]);
    const props = defineProps({
        minHeight: {
            type: Number,
            default: 50 /*单位：%，相对于父元素*/
        },
        maxHeight: {
            type: Number,
            default: 90 /*单位：%，相对于父元素*/
        },
        mapCenterPoint: {
            type: Object,
            default: null
        }
    });
    const SCROLLER_BOX_ID = "sspSearchResultListBox";
    const AUTO_SLIDE_THRESHOLD = 40;
    const PULL_UP_THRESHOLD = 40;
    const hotKeywords = ["平陆运河", "南宁市" ,"钦州市", "陆屋镇", "平塘江口", "马道枢纽", "企石枢纽", "青年枢纽"]; //热门关键字
    
    const panelHeight = ref(props.minHeight);
    const isSearchFocus = ref(false);
    const isPositionning = ref(false); //是否正在定位
    const isLoadingMore = ref(false); //是否正在加载更多
    const cursorType = ref("auto");
    const poiList = ref([]);
    const poiIndex = ref(0);
    const searchKeywords = ref("");
    
    const touchStartXY = [-1, -1];
    const nonRVs = { //非响应式变量（non Responsive Variables）
        isRunTransition: false,
        mapSearcher: null, //文字搜索器
        mapGeocoder: null, //拖动搜索器
        pageIndex: 0, //文字搜索时表示第几页内容
        myLocalPoint: null
    };
    
    function onPanelTouchStart(evt){
        //还原/重置
        const elem = document.getElementById(SCROLLER_BOX_ID);
        if(!elem || elem.scrollTop <= 0){//滚动位置为0时才处理
            if(elem){
                elem.style.overflow = (panelHeight.value !== props.maxHeight ? "hidden" : null);
            }
            
            if(evt.type === "touchstart"){//单个手指触控时才有效
                touchStartXY[0] = (evt.touches.length === 1 ? evt.touches[0].clientX : -1);
                touchStartXY[1] = (evt.touches.length === 1 ? evt.touches[0].clientY : -1);
            } else {//鼠标左键按下时才有效
                touchStartXY[0] = (evt.button === 0 ? evt.clientX : -1);
                touchStartXY[1] = (evt.button === 0 ? evt.clientY : -1);
            }
            cursorType.value = "grab";
        } else {
            touchStartXY[0] = -1;
            touchStartXY[1] = -1;
        }
    }
    function onPanelTouchMove(evt){
        if (touchStartXY[0] >= 0 && touchStartXY[1] >= 0 && !nonRVs.isRunTransition) {
            const isTm = (evt.type === "touchmove");
            const cXY = [(isTm ? evt.touches[0].clientX : evt.clientX), (isTm ? evt.touches[0].clientY : evt.clientY)];
            const diffX = (cXY[0] - touchStartXY[0]);
            const diffY = (cXY[1] - touchStartXY[1]);
            if (Math.abs(diffY) > Math.abs(diffX)) {//上下滑动时才处理。【左右滑动不处理】
                if (diffY > AUTO_SLIDE_THRESHOLD) { //向下滑动
                	if (panelHeight.value >= props.maxHeight) {
                		nonRVs.isRunTransition = true;
                		panelHeight.value = props.minHeight;
                	}
                    touchStartXY[0] = cXY[0];
                    touchStartXY[1] = cXY[1];
                } else if (diffY < -AUTO_SLIDE_THRESHOLD) { //向上滑动
                	if (panelHeight.value <= props.minHeight) {
                		nonRVs.isRunTransition = true;
                		panelHeight.value = props.maxHeight;
                	}
                    touchStartXY[0] = cXY[0];
                    touchStartXY[1] = cXY[1];
                }
            }
        }
    }
    function onPanelTouchEnd(evt){
        //还原/重置
        touchStartXY[0] = -1;
        touchStartXY[1] = -1;
        
        const elem = document.getElementById(SCROLLER_BOX_ID);
        if(elem){
            elem.style.overflow = null;
        }
        
        cursorType.value = "auto";
    }
    function onPanelTransitionEnd(evt) {
        //动画执行结束
    	nonRVs.isRunTransition = false;
    }
    function onInputFocusOrBlur(evt){
        if(evt.type === "focus"){
            isSearchFocus.value = true;
        } else {
            //延迟一点时间，防止点击热门关键字时无法触发 “点击事件”！
            setTimeout(() => (isSearchFocus.value = false), 200);
        }
    }
    function onInputKeydownEnter(evt){//关键字搜索
        if(evt.target.hasAttribute("data-hk")){
            searchKeywords.value = evt.target.getAttribute("data-hk")
        } else {
            evt.target.blur();
        }
        
        if(searchKeywords.value){
            if(!poiList.value){
                return; //正在加载
            } else {
                poiList.value = null;
            }
            
            nonRVs.pageIndex = 1; //默认第一页
            nonRVs.mapSearcher.clearResults();
            nonRVs.mapSearcher.search(searchKeywords.value.trim());
        }
    }
    function onPoiItemSelected(idx){
        if(poiIndex.value === idx){
            emits("itemzoomin", poiList.value[idx].point);
        } else {
            emits("itemselected", poiList.value[idx].point);
        }
        poiIndex.value = idx;
    }
    function onSelectedConfirm(){
        emits("itemconfirm", poiList.value[poiIndex.value]);
    }
    function onPositionMyLocation() {
        if (isPositionning.value) {
            return;
        } else {
            isPositionning.value = true;
        }
    
        const geolocation = new BMapGL.Geolocation();
        geolocation.getCurrentPosition(function(res) {
            const statusCode = this.getStatus();
            if (statusCode === BMAP_STATUS_SUCCESS) {
                nonRVs.myLocalPoint = res.point;
                if(!poiList.value?.length){
                    getPoiListByMapPoint(res.point);
                    emits("itemselected", res.point);
                }
            } else if (statusCode === BMAP_STATUS_PERMISSION_DENIED) {
                appToast("定位失败：BMAP_STATUS_PERMISSION_DENIED");
            } else if (statusCode === BMAP_STATUS_TIMEOUT) {
                appToast("定位失败：BMAP_STATUS_TIMEOUT");
            } else {
                appToast("定位失败：BMAP_STATUS_UNKNOWN_LOCATION");
            }
            
            //如果定位失败，则根据IP地址获取用户所在的城市
            if(!nonRVs.myLocalPoint){
                (new BMapGL.LocalCity()).get(function(exo){
                    nonRVs.myLocalPoint = exo.center;
                    if(!poiList.value?.length){
                        getPoiListByMapPoint(exo.center);
                        emits("itemselected", exo.center);
                    }
                });
            }
            
            setTimeout(() => (isPositionning.value = false), 1000);
        }, {
            enableHighAccuracy: true, //是否要求浏览器获取最佳效果，同浏览器定位接口参数。默认为false
            timeout: 10000, //超时时间，单位为毫秒。默认为10秒
            SDKLocation: true, //是否开启SDK辅助定位
        });
    }
    function onPanelUpOrDown(){
        panelHeight.value = (panelHeight.value !== props.maxHeight ? props.maxHeight : props.minHeight);
    }
    function onMapZoomRestore(){
        emits("maprestore", poiList.value[poiIndex.value].point);
    }
    function onUlScroll(evt){
        const elem = evt.target;
        //上拉加载更多，最多十页
        if(!isLoadingMore.value && nonRVs.pageIndex >= 1 && nonRVs.pageIndex <= 9 && (elem.scrollTop + elem.clientHeight + PULL_UP_THRESHOLD) >= elem.scrollHeight){
            isLoadingMore.value = true;
            nonRVs.mapSearcher.gotoPage(++nonRVs.pageIndex);
        }
    }
    function searchCompleteCallback(evt){
        //console.log("搜索或拖动结果::::", evt);
        const isGeocoding = !!(evt?.surroundingPois); //是否是拖动搜索的
        const resRows = (isGeocoding ? evt?.surroundingPois : evt?._pois) || [];
        const pois = resRows.map(vx => ({
            uid: vx.uid,
            address: vx.address,
            title: vx.title,
            point: vx.point,
            distance: getFriendlyDistance(nonRVs.myLocalPoint, vx.point)
        }));
        
        poiIndex.value = 0;
        isLoadingMore.value = false;
        if(nonRVs.pageIndex > 1){
            poiList.value.push(...pois);
        } else {
            if(isGeocoding){//拖动搜索
                pois.unshift({
                    uid: "map_center_point_001",
                    address: evt.address || "暂无详细地址",
                    title: (evt.content?.poi_desc ? `${evt.content.poi_desc} (地图中心点)` : "地图中心点"),
                    point: evt.point,
                    distance: getFriendlyDistance(nonRVs.myLocalPoint, evt.point)
                });
            }
            poiList.value = pois;
        }
    }
    function getPoiListByMapPoint(thePoint){//拖动搜索
        if(!poiList.value || !thePoint){
            return; //正在加载
        } else {
            poiList.value = null;
        }
        searchKeywords.value = ""; //重置
        nonRVs.pageIndex = 0; //因为是拖动搜索的，所以需要重置为 0
        if(nonRVs.mapGeocoder){//防止退出页面后才定位成功！
            nonRVs.mapGeocoder.getLocation(thePoint, searchCompleteCallback, { poiRadius: 1000, numPois: 20 });
        }
    }
    function initiMapSearcher(bdmap){
        nonRVs.mapSearcher.setLocation(bdmap);
    }
    
    watch(() => props.mapCenterPoint, getPoiListByMapPoint);
    onMounted(() => {
        nonRVs.mapSearcher = new BMapGL.LocalSearch(null, {
            pageCapacity: 20,
            onSearchComplete: searchCompleteCallback
        });
        
        nonRVs.mapGeocoder = new BMapGL.Geocoder();
        
        nextTick(onPositionMyLocation);
    });
    onUnmounted(() => {
        if(nonRVs.mapSearcher){
            nonRVs.mapSearcher.dispose();
            nonRVs.mapSearcher = null;
        }
        if(nonRVs.mapGeocoder){
            nonRVs.mapGeocoder.dispose();
            nonRVs.mapGeocoder = null;
        }
    });
    
    defineExpose({
        initiMapSearcher
    });
</script>

<style>
    .ssp-search-panel{
        display: flex;
        flex-direction: column;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background-color: #fff;
        user-select: none;
        transition: height 200ms ease-out 0s;
        box-shadow: 0 0 0.2rem 0 #e0e0e0;
        cursor: grab;
    }
    .ssp-search-input{
        background-color: #f0f0f0;
        padding: 0.4rem 2rem;
        border-radius: 3rem;
        border: 0.1rem solid #f0f0f0;
        flex: 1;
    }
    .ssp-search-input:focus{
        border-color: var(--main-color);
    }
    .ssp-poi-item{
        padding: 0.5rem 0;
        border-bottom: 0.05rem solid #f0f0f0;
        position: relative;
    }
    .ssp-poi-item:active::before{
        content: "";
        display: block;
        position: absolute;
        inset: 0 -0.5rem 0 -0.5rem;
        background-color: #f0f0f0;
        z-index: -1;
    }
    .ssp-poi-checked{
        display: block;
        position: absolute;
        right: 0;
        top: calc(50% - 0.5rem);
        z-index: 1;
        width: 1rem;
        height: 1rem;
    }
    .ssp-my-location {
        display: inline-block;
        width: 1.9rem;
        height: 1.9rem;
        padding: 0.25rem;
        background-color: #f0f0f0;
        border-radius: 50%;
        cursor: pointer;
        margin-left: 0.5rem;
    }
    .ssp-my-location.positionning{
        animation: mcv-location-positionning-kf 1s ease infinite; /* 动画帧在控件 “map3dControlVertical” 里定义 */
    }
    .ssp-btn-done{
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 2.5rem;
        font-size: 0.8rem;
        color: #fff;
        background-color: var(--main-color);
        background-image: linear-gradient(90deg, rgba(167,209,41,0.0) 0%, rgba(167,209,41,0.5) 100%);
        margin-left: 0.5rem;
        line-height: 1;
    }
    .ssp-hk-item{
        margin: 0 0.25rem 0.25rem 0;
        padding: 0.4rem 0.8rem;
        background-color: #eee;
        font-size: 0.7rem;
        border-radius: 2rem;
        cursor: pointer;
    }
</style>