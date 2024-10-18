<template>
    <div class="page-limit-width">
        <div ref="cageRef" class="content-cage wfl-content-box">
            <ul id="wflUlDataBox" v-if="dataList.length" class="ps-r">
                <li v-for="item in dataList" :key="item.id" :style="columnInfo.csstxt" class="wfl-item-box" @click="onItemClick(item)">
                    <img :src="item.pictureList[0].thumbnailPath" class="dp-bk wi-f" onerror="onImageLoadingError()" />
                    <p v-if="item.title.length > MAX_TEXT_LENGTH" class="wfl-item-title">{{item.title.substr(0, MAX_TEXT_LENGTH)}}…</p>
                    <p v-else class="wfl-item-title">{{item.title}}</p>
                    <div class="pd-lr-rem25 pd-b-rem5 tc-99 fs-rem6 fx-hc">
                        <img :src="item.authorAvatarUrl" alt="作者头像" class="wh-1rem br-h" />
                        <span class="fx-g1">&nbsp;{{item.authorNickname}}</span>
                        <span>&nbsp;{{item.createTime?.substr(0, 10)}}</span>
                    </div>
                    <img v-if="item.isVideo" :src="publicAssets.iconPlayCircle" class="wfl-is-video" alt="视频内容" />
                </li>
            </ul>
            <ul v-if="isLoading" title="骨架屏" class="ps-r" :style="loadingSkeletonStyles[0].myParentStyle">
                <li v-for="vx in loadingSkeletonStyles" :key="vx.ssid" :style="vx" class="wfl-item-box fx-c">
                    <div class="skeleton-loading-ani fx-g1"></div>
                    <div class="wfl-item-title">
                        <p class="skeleton-loading-text wi-f"></p>
                        <p class="skeleton-loading-text wi-col-8"></p>
                    </div>
                    <div class="pd-lr-rem25 pd-b-rem5 fs-rem6 fx-r">
                        <span class="skeleton-loading-avatar br-h"></span>
                        <span class="skeleton-loading-text mg-l-rem25"></span>
                        <span class="fx-g1 hi-1rem"></span>
                        <span class="skeleton-loading-text wi-col-4"></span>
                    </div>
                </li>
            </ul>
            <section v-else-if="errMsg" class="ta-c pd-1rem">
                <b class="tc-o0">加载出错：</b>
                <b class="tc-r0">{{errMsg}}</b>
                <a class="tc-b0 fw-b" @click="onRetry">&emsp;重试</a>
            </section>
            <section v-else-if="isNoMore" class="ta-c pd-1rem">
                <span v-if="dataList.length" class="tc-cc">没有更多了~</span>
                <span v-else class="tc-99">他还没有分享过照片~</span>
            </section>
        </div>
    </div>
</template>

<script setup name="CanalWaterfallFlowList">
    import { computed, nextTick, onMounted, reactive, ref } from "vue";
    import { useRouter } from "vue-router";
    import { arrayFindIndexOfMinValue, getScrollBarWidth } from "@/utils/pagehelper.js";
    
    import ajaxRequest from "@/request/index.js";
    import publicAssets from "@/assets/data/publicAssets.js";
    import myStorage from "@/utils/mystorage.js";
    
    const COLUMN_GAP = 6; //每列的间隙（像素）
    const MAX_TEXT_LENGTH = 50; //显示的最大文本长度
    
    const $router = useRouter();
    const dataList = reactive([]);
    const cageRef = ref(null);
    const isLoading = ref(false); //是否正在加载
    const isNoMore = ref(false); //是否还有更多数据
    const pageIndex = ref(0); //第几页
    const errMsg = ref(null); //加载时的错误文本信息
    const loadingSkeletonStyles = reactive([{ myParentStyle: null }]); //加载骨架屏的样式
    const columnInfo = { //列信息
        width: 0, 
        count: 0,
        heights: [],
        lefts: [],
        csstxt: "",
    };
    
    function getDataList(){
        if(isLoading.value || isNoMore.value){
            return;
        } else {
            isLoading.value = true;
            pageIndex.value++;
        }
        
        buildSkeletonScreen();
        
        ajaxRequest("getUserPostList", null, true).then(res => {
            if(res && res.length){
                dataList.push(...res);
            }
            isNoMore.value = true;
            errMsg.value = null;
            setTimeout(updateItemStyle, 1000);
        }).catch(err => {
            errMsg.value = err;
            isLoading.value = false;
            isNoMore.value = false;
        });
    }
    
    function onRetry(){
        isLoading.value = false;
        isNoMore.value = false;
        pageIndex.value = 0;
        errMsg.value = null;
        dataList.splice(0);
        columnInfo.heights.fill(COLUMN_GAP);
        getDataList();
    }
    
    function onItemClick(item){
        //数据量有点大，保存在临时存储里
        myStorage.onceObject("user_sharepic_infos_" + item.id, item);
        if(!item.isVideo){//照片内容
            $router.push("/map3ddetails?sid=" + item.id);
        } else {//视频内容
            $router.push("/map3dvideo?sid=" + item.id);
        }
    }
    
    function updateItemStyle(){
        $("#wflUlDataBox").children().each(function(index, elem){
            let chei = elem.clientHeight;
            let nth = arrayFindIndexOfMinValue(columnInfo.heights);
            
            elem.style.top = columnInfo.heights[nth] + "px";
            elem.style.left = columnInfo.lefts[nth] + "px";
            elem.style.opacity = null;
            
            columnInfo.heights[nth] += (chei + COLUMN_GAP);
        }).end().css("height", Math.max(...columnInfo.heights));
        
        isLoading.value = false;
    }
    
    //创建骨架屏
    function buildSkeletonScreen(){
        const offset = Math.max(...columnInfo.heights);
        const temp = (offset <= COLUMN_GAP ? Array.from(columnInfo.heights) : columnInfo.heights.map(vx => (vx - offset)));
        const leng = columnInfo.count * 3;
        
        loadingSkeletonStyles.splice(0);

        for(let ix = 0; ix < leng; ix++){
            let hhh = Math.round(200 + Math.random() * 100);
            let nth = arrayFindIndexOfMinValue(temp);
            
            loadingSkeletonStyles.push({
                ssid: ix,
                height: hhh + "px",
                width: columnInfo.width + "px",
                left: columnInfo.lefts[nth] + "px",
                top: temp[nth] + "px"
            });
            
            temp[nth] += (hhh + COLUMN_GAP);
        }
        
        loadingSkeletonStyles[0].myParentStyle = ("height:" + Math.max(...temp) + "px");
    }
    
    onMounted(() => {
        const cw = cageRef.value.clientWidth - (IS_MOBILE ? 0 : getScrollBarWidth()); //如果是PC端，需要减去滚动条的宽度
        
        columnInfo.count = Math.round(cw / (10 * window.pxOf1rem)); //列数
        columnInfo.width = Math.floor((cw - (columnInfo.count + 1) * COLUMN_GAP) / columnInfo.count); //每列宽度
        columnInfo.csstxt = (`width:${columnInfo.width}px;opacity:0`); //每项的初始样式
        columnInfo.heights = (new Array(columnInfo.count)).fill(COLUMN_GAP); //每列的当前累计高度
        columnInfo.lefts = columnInfo.heights.map((vx, ix) => (ix * (columnInfo.width + COLUMN_GAP) + COLUMN_GAP)); //每列的距离左边位置
        
        getDataList();
    });
</script>

<style scoped="scoped">
    .wfl-content-box{
        padding: 0;
        background-color: #ddd;
    }
    .wfl-item-box{
        position: absolute;
        z-index: 1;
        cursor: pointer;
        overflow: hidden;
        background-color: #fff;
        border-radius: 0.25rem;
    }
    .wfl-item-box:active{
        opacity: 0.6;
    }
    .wfl-item-title{
        padding: 0.5rem 0.25rem;
        font-size: 0.7rem;
        font-weight: 500;
    }
    .wfl-is-video{
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        z-index: 1;
        width: 1.5rem;
        height: 1.5rem;
    }
</style>