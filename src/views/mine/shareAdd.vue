<template>
    <div class="page-limit-width">
        <div class="content-cage">
            <div class="ps-r mg-b-1rem">
                <textarea v-model="descText" class="msa-textarea-box of-no-sb" rows="3" placeholder="说点什么吧~" :maxlength="MAX_TEXT_LENGTH" @input="onTextAreaInput" />
                <span class="msa-input-remaining">{{inputRemainingLength}}</span>
            </div>
            <div class="mg-b-rem5 bd-t-f0"><!-- 分隔线 --></div>
            <picture-uploader ref="puBox" />
            <div class="mg-t-rem25 bd-t-f0"><!-- 分隔线 --></div>
            <div class="fx-hc lh-1x pd-tb-rem5 mg-t-rem5 us-n" @click="gotoAddressPicker">
                <template v-if="!shootingAddress">
                    <img :src="publicAssets.iconAddShareLocation" class="wh-1em" />
                    <a class="mg-lr-rem5 tc-99 fx-g1">添加照片拍摄地点</a>
                </template>
                <template v-else >
                    <img :src="publicAssets.iconAddShareLocationGreen" class="wh-1em" />
                    <a class="mg-lr-rem5 tc-mc fx-g1">{{shootingAddress}}</a>
                </template>
                <img :src="publicAssets.iconArrowRight" class="wh-1em op-6" />
            </div>
        </div>
        <div class="fixed-limit-width po-br-0 pd-1rem">
            <button class="btn-box" @click="onPublishes">发 布</button>
        </div>
    </div>
</template>

<script setup name="MineShareAdd">
    import { ref, getCurrentInstance, computed } from "vue";
    import { useRouter } from "vue-router";
    import { useStore } from "vuex";
    import publicAssets from "@/assets/data/publicAssets.js";
    import pictureUploader from "@/components/pictureUploader.vue";
    import ajaxRequest from "@/request/index.js";
    
    const MAX_TEXT_LENGTH = 160;
    
    const $instance = getCurrentInstance();
    const $router = useRouter();
    const $store = useStore();
    const inputRemainingLength = ref(MAX_TEXT_LENGTH);
    const descText = ref("");
    const shootingAddress = computed(() => $store.getters.pickPlaceTitle);

    function gotoAddressPicker(){
        $router.push("/map3dpicker");
    }
    function onTextAreaInput(evt){
        evt.target.style.height = "20px";
        evt.target.style.height = Math.max(Math.min(evt.target.scrollHeight, 288), 72) + "px";
        inputRemainingLength.value = (MAX_TEXT_LENGTH - evt.target.value.length);
    }
    function onPublishes(){
        if(!descText.value.trim()){
            return !appToast("请填写照片标题");
        }
        if(!$instance.refs.puBox.getFileCount()){
            return !appToast("请上传要分享的照片");
        }
        if(!shootingAddress.value){
            return !appToast("请添加照片拍摄地点");
        }
        $instance.refs.puBox.startUpload().then(pics => {
            ajaxRequest("saveUserSharePics", {
                "title": descText.value,
                "authorNickname": "",
                "authorAvatarUrl": "",
                "longitude": $store.getters.pickPlaceLongitude,
                "latitude": $store.getters.pickPlaceLatitude,
                "locationAddress": shootingAddress.value,
                "pictureList": pics
            }).then(res => {
                $store.dispatch("setPickPlaceInfo", null);
                $router.back();
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            appToast("上传失败");
        });
    }
</script>

<style scoped="scoped">
    .msa-textarea-box{
        display: block;
        border: 0;
        resize: none;
        padding: 0;
        line-height: 1.5;
    }
    .msa-input-remaining{
        display: block;
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 1;
        color: #aaa;
        font-size: 0.6rem;
        line-height: 1.0;
    }
</style>