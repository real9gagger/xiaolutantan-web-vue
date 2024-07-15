<template>
    <div class="mcv-box-container">
        <div @click="onPositionMyLocation" class="mcv-action-box" :class="{'mcv-positionning-ani': isPositionning}" title="定位到我的位置">
            <img class="dp-bk wh-f" :src="publicAssets.iconMapLocationPosition" />
        </div>
        <div @click="onRestorePerspective" class="mcv-action-box" title="还原视图">
            <img class="dp-bk wh-f" :src="publicAssets.iconMapRestorePerspective" />
        </div>
        <div @click="onShowOrHideCallout" class="mcv-action-box" title="显示或隐藏用户分享的照片">
            <img v-if="isCalloutShowing" class="dp-bk wh-f" :src="publicAssets.iconMapCalloutShowing" />
            <img v-else class="dp-bk wh-f" :src="publicAssets.iconMapCalloutHiding" />
        </div>
        <div @click="onToggleMapType" class="mcv-action-box" title="切换成卫星地图或普通地图">
            <img v-if="isSatelliteMap" class="dp-bk wh-f" :src="publicAssets.iconMapToggleLayers" />
            <img v-else class="dp-bk wh-f" :src="publicAssets.iconMapSatelliteFill" />
        </div>
        <div @click="onShowOrHideRegion" class="mcv-action-box" title="显示行政区域">
            <img class="dp-bk wh-f" :src="publicAssets.iconMapAdministrativeRegion" />
        </div>
        <div @click="onGotoMyAccount" class="mcv-action-box user-avatar" title="转到个人中心">
            <img class="dp-bk wh-f" :src="publicAssets.iconDefaultUserAvatar" />
        </div>
    </div>
</template>

<script setup name="Map3DControlVertical">
    import { ref, defineEmits } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";

    const isCalloutShowing = ref(true);
    const isSatelliteMap = ref(false);
    const isPositionning = ref(false); //是否正在定位

    const emits = defineEmits([
        "positionlocation",
        "restoreperspective",
        "togglecallout",
        "togglemaptype",
        "toggleregion",
        "gotoaccount",
    ]);

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
                if(res.point){
                    emits("positionlocation", {
                        locationAddress: getMyAddress(res.address),
                        locationPoint: res.point
                    });
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

    function onRestorePerspective() {
        emits("restoreperspective", true);
    }

    function onShowOrHideCallout() {
        isCalloutShowing.value = !isCalloutShowing.value;
        emits("togglecallout", isCalloutShowing.value);
    }

    function onToggleMapType() {
        isSatelliteMap.value = !isSatelliteMap.value;
        emits("togglemaptype", isSatelliteMap.value);
    }

    function onShowOrHideRegion() {
        emits("toggleregion", null);
    }

    function onGotoMyAccount() {
        emits("gotoaccount", true);
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
</script>

<style>
    @keyframes mcv-location-positionning-kf {/* 正在定位动画 */
        from { transform: rotate(0deg) }
        to { transform: rotate(360deg) }
    }

    .mcv-box-container {
        position: fixed;
        bottom: 0.5rem;
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

    .mcv-action-box.user-avatar {
        padding: 0;
        background-color: var(--main-color);
    }

    .mcv-positionning-ani {
        animation: mcv-location-positionning-kf 1s ease infinite;
    }
</style>