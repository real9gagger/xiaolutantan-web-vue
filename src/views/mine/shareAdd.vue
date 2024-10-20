<template>
    <div class="page-limit-width">
        <div class="content-cage">
            <div class="ps-r mg-b-1rem">
                <textarea v-model="descText" class="msa-textarea-box of-no-sb" rows="3" placeholder="有什么有趣的收获~" :maxlength="MAX_TEXT_LENGTH" @input="onTextAreaInput" />
                <span class="msa-input-remaining">{{inputRemainingLength}}</span>
            </div>
            <div class="mg-b-rem5 bd-t-f0"><!-- 分隔线 --></div>
            <picture-uploader ref="puBox" @pictap="gotoImagePreview" />
            <div class="mg-t-rem25 bd-t-f0"><!-- 分隔线 --></div>
            <div class="fx-hc lh-1x pd-tb-rem5 mg-t-rem5 us-n" @click="gotoAddressPicker">
                <template v-if="!captureAddress">
                    <img :src="publicAssets.iconAddShareLocation" class="wh-1em" />
                    <a class="mg-lr-rem25 tc-66 fx-g1">添加照片拍摄地点</a>
                </template>
                <template v-else >
                    <img :src="publicAssets.iconAddShareLocationGreen" class="wh-1em" />
                    <a class="mg-lr-rem25 tc-mc fx-g1">{{captureAddress}}</a>
                </template>
                <img :src="publicAssets.iconArrowRight" class="wh-1em op-6" />
            </div>
            <div class="mg-t-rem5 bd-t-f0"><!-- 分隔线 --></div>
            <div class="fx-hc lh-1x pd-tb-rem5 mg-t-rem5 us-n" @click="gotoUserPicker">
                <img :src="publicAssets.iconThePostAuthor" class="wh-1em" />
                <span class="mg-lr-rem25 tc-66 fx-g1">内容创作者</span>
                <template v-if="authorName" >
                    <b class="mg-lr-rem5">{{authorName}}</b>
                    <img :src="$store.getters.pickUserAvatarUrl" class="wh-1rem br-h" />
                </template>
                <img :src="publicAssets.iconArrowRight" class="wh-1em op-6" />
            </div>
            <div class="mg-t-rem5 bd-t-f0"><!-- 分隔线 --></div>
            <div class="fx-hc lh-1x pd-tb-rem5 mg-t-rem5 us-n" @click="gotoSourceUrlInputer">
                <img :src="publicAssets.iconPictureSourceUrl" class="wh-1em" />
                <span class="mg-lr-rem25 tc-66 fx-g1">照片来源</span>
                <span v-if="shortSourceUrl" class="ta-r" target="_blank">{{shortSourceUrl}}…</span>
                <img :src="publicAssets.iconArrowRight" class="wh-1em op-6" />
            </div>
            <div class="mg-t-rem5 bd-t-f0"><!-- 分隔线 --></div>
        </div>
        <div class="fixed-limit-width po-b-0 pd-1rem">
            <button v-if="!isPublishing" type="button" class="btn-box" @click="onPublishes">发 布</button>
            <button v-else type="button" class="btn-box ajaxing">正在发布…</button>
        </div>
        <div v-if="isPublishing" class="ps-f po-f zi-x5" @click="onPublishingTips"><!-- 正在发布时显示的遮罩层，防止误触 --></div>
    </div>
</template>

<script setup name="MineShareAdd">
    import { ref, getCurrentInstance, computed } from "vue";
    import { useRouter } from "vue-router";
    import { useStore } from "vuex";
    import { setPageTempData } from "@/utils/pagehelper.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import pictureUploader from "@/components/pictureUploader.vue";
    import ajaxRequest from "@/request/index.js";
    
    const MAX_TEXT_LENGTH = 500;
    
    const $instance = getCurrentInstance();
    const $router = useRouter();
    const $store = useStore();
    const inputRemainingLength = ref(MAX_TEXT_LENGTH);
    const descText = ref("");
    const isPublishing = ref(false); //是否正在发布
    const captureAddress = computed(() => $store.getters.pickPlaceAddress);
    const authorName = computed(() => $store.getters.pickUserNickName);
    const shortSourceUrl = computed(() => {
        if(!$store.getters.pickPictureSourceUrl){
            return "";
        }
        
        const idx = $store.getters.pickPictureSourceUrl.indexOf("/", 8);
        return (idx >= 0 ? $store.getters.pickPictureSourceUrl.substr(0, idx) : $store.getters.pickPictureSourceUrl);
    });
    
    function gotoAddressPicker(){
        $router.push("/map3dpicker");
    }
    function gotoUserPicker(){
        $router.push("/userpicker");
    }
    function gotoSourceUrlInputer(){
        $router.push("/picturesourceurl");
    }
    function gotoImagePreview(arg0){
        setPageTempData(arg0);
        $router.push("/imagepreview");
    }
    function onTextAreaInput(evt){
        evt.target.style.height = "20px";
        evt.target.style.height = Math.max(Math.min(evt.target.scrollHeight, 288), 72) + "px";
        inputRemainingLength.value = (MAX_TEXT_LENGTH - evt.target.value.length);
    }
    function onPublishes(){
        if(isPublishing.value){
            return false;
        }
        
        if(!descText.value.trim()){
            return !appToast("请填写照片标题");
        }
        if(!$instance.refs.puBox.getFileCount()){
            return !appToast("请上传要分享的照片");
        }
        if(!captureAddress.value){
            return !appToast("请添加照片拍摄地点");
        }
        if(!authorName.value){
            return !appToast("请选择内容创作者");
        }
        if(!shortSourceUrl.value){
            return !appToast("请补充照片来源网址");
        }
        
        isPublishing.value = true;
        $instance.refs.puBox.startUpload().then(pics => {
            ajaxRequest("saveUserSharePics", {
                "title": descText.value,
                "authorNickname": authorName.value,
                "authorAvatarUrl": $store.getters.pickUserAvatarUrl,
                "longitude": $store.getters.pickPlaceLongitude,
                "latitude": $store.getters.pickPlaceLatitude,
                "locationAddress": captureAddress.value,
                "pictureSourceUrl": $store.getters.pickPictureSourceUrl,
                "pictureList": pics
            }).then(res => { 
                //！！！如果保存成功后页面会自动刷新，那是因为 vue-cli 监听到项目文件有变更，因此刷新页面，正式环境不会有此问题
                $store.dispatch("setThereAreNewPosts", true);
                $store.dispatch("setPickPlaceInfo", null);
                $store.dispatch("setPickPictureSource", null);
                appToast("发布成功");
                setTimeout($router.back, 300);
            }).catch(err => {
                isPublishing.value = false;
            });
        }).catch(err => {
            appToast("上传照片失败，请稍后重试");
            isPublishing.value = false;
        });
    }
    function onPublishingTips(){
        appToast("正在上传文件，请耐心等待…");
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