<template>
    <div class="page-limit-width">
        <div class="content-cage">
            <h4 class="ta-c pd-rem5">测试中心</h4>
            <div class="mg-t-1rem ta-c">
                <button type="button" class="btn-box wi-f" @click="gotoMapDev">地图开发测试 {{aliveTimes}}</button>
            </div>
            <div class="mg-t-1rem ta-c">
                <input type="file" class="dp-hd" id="fileToUploadBox" name="my_file" @change="startUploadFile" />
                <button type="button" class="btn-box wi-f" @click="testServer">测试服务器情况</button>
            </div>
        </div>
    </div>
</template>

<script setup name="TestIndex">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import fileUploader from "@/utils/fileuploader.js";
    
    const $router = useRouter();
    const aliveTimes = ref(90);

    function gotoMapDev() {
        aliveTimes.value += 10;
        $router.push("/testmapdev");
    }

    function testServer() {
        document.getElementById("fileToUploadBox").click();
    }

    function startUploadFile(evt) {
        //console.log(evt)
        const fud = new fileUploader();
        console.log(fud);
        fud.reset().progress(function(arg){
            console.log("上传进度::::", arguments);
        }).success(function(arg){
            console.log("上传成功::::", arguments);
        }).error(function(arg){
            console.log("上传出错::::", arguments);
        }).upload(evt.target.files[0]);
    }
</script>

<style scoped="scoped">
</style>