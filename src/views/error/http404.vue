<template>
  <div class="error404">
    <div class="error404-body-con">
		<div class="tc-red ta-c fs-1rem5 fw-b">ERROR</div>
		<div class="fw-b ta-c tc-red mg-t-rem25">页面 “{{theUrl}}” 不存在</div>
        <div class="error404-body-con-title">4<span>0</span>4</div>
        <div class="error404-body-con-message">
			<p>找不到此页面</p>
			<p class="mg-t-rem5">YOU&nbsp;LOOK&nbsp;LOST</p>
		</div>
        <div class="error404-body-con-btns">
          <a @click="goHome" class="tc-mc">返回主页</a>
          <a @click="backPage" class="tc-mc mg-l-2rem">返回上一页</a>
        </div>
    </div>
	<div class="error404-copy-right">{{$appName}}@2024</div>
  </div>
</template>

<script setup name="ErrorHttp404">
    import { onMounted, ref } from "vue";
    import { useRoute, useRouter } from "vue-router";
    
    const $route = useRoute();
    const $router = useRouter();
    const theUrl = ref("/unkownpage");

    function backPage() {
        $router.go(-1);
    }
    function goHome() {
        $router.replace("/");
    }
    
    onMounted(() => {
        if($route.redirectedFrom && $route.redirectedFrom.fullPath){
            theUrl.value = ($route.redirectedFrom.fullPath);
        }
    });
</script>
<style lang="scss" scoped="scoped">
    @keyframes error404animation {
    0% {
        transform: rotateZ(0deg);
    }
    20% {
        transform: rotateZ(-60deg);
    }
    40% {
        transform: rotateZ(-10deg);
    }
    60% {
        transform: rotateZ(50deg);
    }
    80% {
        transform: rotateZ(-20deg);
    }
    100% {
        transform: rotateZ(0deg);
    }
    }
    .error404 {
        width: 100vw;
        height: 100vh;
        &-body-con {
            max-width: 40rem;
            height: 20rem;
            position: absolute;
            left: 50%;
            top: 50%;
            z-index: 1;
            transform: translate(-50%, -50%);
            width: 100%;
            &-title {
                text-align: center;
                font-size: 8rem;
                font-weight: 700;
                color: #2d8cf0;
                span {
                    display: inline-block;
                    color: #19be6b;
                    font-size: 7rem;
                    padding:0 0.5rem;
                    animation: error404animation 3s ease 0s infinite alternate;
                }
            }
            &-message {
                display: block;
                text-align: center;
                font-size: 0.8rem;
                color: #999;
            }
            &-btns {
                text-align: center;
                padding: 2rem 0 1rem 0;
                font-weight: bold;
                font-size: 1rem;
            }
        }
        &-copy-right {
            text-align: center;
            position: absolute;
            width: 100%;
            left: 0;
            bottom: 0.5rem;
            color: #ccc;
            font-size: 0.6rem;
        }
    }
</style>
