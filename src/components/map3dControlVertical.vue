<template>
    <div class="mcv-box-container">
        <div @click="onShowHelps" class="mcv-action-box" title="显示图标功能描述">
            <img class="dp-bk wh-f" :src="publicAssets.iconHelpQuestion" />
        </div>
        <div @click="onGotoAboutCanal" class="mcv-action-box" title="关于平陆运河">
            <img class="dp-bk wh-f" :src="publicAssets.iconHelpAboutCanal" />
        </div>
        <div @click="onToggleFullScreen" class="mcv-action-box" title="切换或取消全屏显示">
            <img class="dp-bk wh-f" :src="!isFS ? publicAssets.iconFullScreen : publicAssets.iconFullScreenExit" />
        </div>
        <div @click="onClickShare" class="mcv-action-box" title="分享此页面">
            <img class="dp-bk wh-f" :class="{'mcv-sharing-ani': isSharing}" :src="publicAssets.iconShareGreen" />
        </div>
        <div @click="onPositionMyLocation" class="mcv-action-box" title="定位到我的位置">
            <img class="dp-bk wh-f" :class="{'mcv-positionning-ani': isPositionning}" :src="publicAssets.iconMapLocationPosition" />
        </div>
        <div @click="onRestorePerspective" class="mcv-action-box" title="还原成默认视图">
            <img class="dp-bk wh-f" :src="publicAssets.iconMapRestorePerspective" />
        </div>
        <div @click="onShowOrHideRegion" class="mcv-action-box" title="地图展示设置">
            <img class="dp-bk wh-f" :src="publicAssets.iconMapAdministrativeRegion" />
        </div>
        <div @click="onShowOrHideCallout" class="mcv-action-box" title="显示或隐藏图集">
            <img class="dp-bk wh-f" :src="isCalloutShowing ? publicAssets.iconMapCalloutShowing : publicAssets.iconMapCalloutHiding" />
        </div>
        <div @click="onToggleMapType" class="mcv-action-box" title="切换成卫星或普通地图">
            <img class="dp-bk wh-f" :src="isSatelliteMap ? publicAssets.iconMapToggleLayers : publicAssets.iconMapSatelliteFill" />
        </div>
        <div @click="onPanoramicView" class="mcv-action-box pano-view" title="全景视图">
            <img class="dp-bk wh-f" :src="publicAssets.iconPanoramicView" />
        </div>
        <div @click="onGotoMyAccount" class="mcv-action-box user-avatar" title="转到个人中心">
            <img class="dp-bk wh-f" :src="publicAssets.iconDefaultUserAvatar" />
        </div>
        <ul v-show="isShowHelps" class="mcv-help-box" ref="mcvHelpBox">
            <li v-for="txt, idx in helpDescTitles" class="mcv-help-item"
                :key="txt" 
                :class="{'slideout': isSlideOut}"
                :style="getHelpItemStyle(idx)">{{txt}}</li>
        </ul>
    </div>
</template>

<script setup name="Map3DControlVertical">
    import { ref, defineEmits, getCurrentInstance, reactive, computed } from "vue";
    import { useStore } from "vuex";
    import { mapLayerType } from "@/assets/data/constants.js";
    import publicAssets from "@/assets/data/publicAssets.js";

    const isCalloutShowing = ref(true); //是否显示图集气泡
    const isPositionning = ref(false); //是否正在定位
    const isShowHelps = ref(false); //是否显示帮助框
    const isSlideOut = ref(false); //提示小组件是否滑出
    const helpDescTitles = reactive([]); //图标的功能描述
    const isFS = ref(document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen || false); //是否正在全屏显示
    const isSharing = ref(false);
    const isSatelliteMap = computed(() => ($store.getters.mapLayerType===mapLayerType.SATELLITE)); //是否显示卫星地图
    
    const emits = defineEmits([
        "onshare",
        "onaboutcanal",
        "positionlocation",
        "restoreperspective",
        "togglecallout",
        "toggleregion",
        "panoramicview",
        "gotoaccount",
    ]);
    const $instance = getCurrentInstance();
    const $store = useStore();
    
    function onClickShare(){
        if(navigator.share && window.fetch){
            isSharing.value = true;
            window.fetch(publicAssets.imagePictureForShare).then(res => {
                if(res.ok){
                    res.blob().then(theBlob => {
                        const idx = res.url.lastIndexOf("/") + 1;
                        const fileName = res.url.substr(idx);
                        navigator.share({
                            url: location.href,
                            text: "刚刚有人分享了平陆运河的游览照片，快点去看看吧",
                            title: "平陆运河最新图集",
                            files: [new File([theBlob], fileName, { type: theBlob.type })]
                        });
                        isSharing.value = false;
                    });
                } else {
                    appToast("分享失败：" + res.statusText);
                    isSharing.value = false;
                }
            }).catch(err => {
                appToast("分享出错：" + err.message);
                isSharing.value = false;
            });
        } else {
            emits("onshare", true);
        }
    }
    
    function onGotoAboutCanal(){
        emits("onaboutcanal", true);
    }
    
    function onToggleFullScreen(){
        if(!(document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen)){
            document.documentElement.requestFullscreen();
            isFS.value = true;
        } else{
            document.exitFullscreen();
            isFS.value = false;
        }
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
                //console.log(res)
                emits("positionlocation", {
                    locationAddress: getMyAddress(res.address),
                    locationPoint: res.point
                });
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
            SDKLocation: true, //是否开启SDK辅助定位
        });
    }

    function onRestorePerspective() {
        emits("restoreperspective", true);
    }

    function onShowOrHideCallout() {
        isCalloutShowing.value = !isCalloutShowing.value;
        emits("togglecallout", isCalloutShowing.value);
    }

    function onToggleMapType() {
        $store.dispatch("toggleMapLayerType", !isSatelliteMap.value ? mapLayerType.SATELLITE : mapLayerType.NORMAL);
    }

    function onShowOrHideRegion() {
        emits("toggleregion", null);
    }

    function onPanoramicView(){
        emits("panoramicview", true);
    }

    function onGotoMyAccount() {
        emits("gotoaccount", true);
    }
    
    function onShowHelps(){
        if(!helpDescTitles.length){
            $($instance.proxy.$el).children(".mcv-action-box").each(function(idx, dom){
                helpDescTitles.push(dom.title);
            });
        }
        
        if(!isShowHelps.value){
            isShowHelps.value = true;
            setTimeout(() => {
                isSlideOut.value = true;
            }, 50);
        } else {
            isSlideOut.value = false;
            setTimeout(() => {
                isShowHelps.value = false;
            }, 500);
        }
    }
    
    function getMyAddress(addr) {
        let output = "";

        if (addr.country && addr.country !== "中国") {
            output += addr.country;
        }
        if (addr.province) {
            output += addr.province;
        }
        if (addr.city) {
            output += addr.city;
        }
        if (addr.district) {
            output += addr.district;
        }
        if (addr.street) {
            output += addr.street;
        }
        if (addr.street_number) {
            output += addr.street_number;
        }

        return output;
    }
    
    function getHelpItemStyle(idx){
        return ("transition: all 200ms ease-out " + (idx * 20) + "ms");
    }
</script>

<style>
    @keyframes mcv-location-positionning-kf {/* 正在定位动画帧 */
        from { transform: rotate(0deg) }
        to { transform: rotate(360deg) }
    }
    @keyframes mcv-share-fetching-kf {/* 正在获取分享图片动画帧 */
        from { transform: scale(1) rotateZ(0deg) }
        to { transform: scale(0.75) rotateZ(10deg) }
    }

    .mcv-box-container {
        position: fixed;
        bottom: 0;
        right: 0.5rem;
        z-index: 8888;
    }

    .mcv-action-box {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        padding: 0.25rem;
        box-shadow: 0 0 0.5rem 0 #43BA6299;
        border: 0.05rem solid var(--main-color);
        margin-bottom: 0.5rem;
        background-color: #fff;
        overflow: hidden;
        cursor: pointer;
    }

    .mcv-action-box:active {
        background-color: #d9f1df;
    }

    .mcv-action-box.pano-view {
        box-shadow: 0 0 0.5rem 0 #ff660099;
        border: 0.05rem solid #ff6600;
    }
    
    .mcv-action-box.user-avatar {
        padding: 0;
        background-color: var(--main-color);
    }

    .mcv-positionning-ani {
        animation: mcv-location-positionning-kf 1s ease infinite;
    }
    
    .mcv-sharing-ani {
        animation: mcv-share-fetching-kf 1s ease infinite alternate;
    }
    
    .mcv-help-box{
        position: absolute;
        top: -0.5rem;
        right: 50%;
        bottom: 0;
        z-index: -1;
        width: 9.5rem;
        padding: 0.5rem 0 0 0.5rem;
        font-size: 0.7rem;
        overflow: hidden;
    }
    
    .mcv-help-item{
        line-height: 1.8rem;
        height: 1.8rem;
        margin-top: 0.1rem;
        margin-bottom: 0.7rem;
        background-color: #fff;
        padding: 0 0.5rem;
        border-radius: 1rem 0 0 1rem;
        box-shadow: 0 0 0.3rem 0 var(--main-color);
        transform: translateX(100%);
        opacity: 0;
    }
    
    .mcv-help-item.slideout{
        transform: translateX(0);
        opacity: 1;
    }
</style>