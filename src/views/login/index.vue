<template>
    <div class="page-limit-width">
        <!-- 两个隐藏的输入框 -->
        <input id="pnInputBox" type="tel" class="ps-f po-tl-0 op-0 zi-10 hi-0"
            :maxlength="pnMaxLength" 
            @focus="onPnFocus" 
            @blur="onPnFocus"
            @input="onPnInput" />
        <input id="vcInputBox" type="number" class="ps-f po-tl-0 op-0 hi-0"
            :maxlength="vcMaxLength" 
            @focus="onVcFocus" 
            @blur="onVcFocus"
            @input="onVcInput" />
        <div class="content-cage us-n">
            <div class="ta-r">
                <a class="tc-99" @click="onChangeRegion">中国大陆&nbsp;(+86)</a>
            </div>
            <div class="tc-66" :class="{'tc-mc': isPnFocus}">手机号码</div>
            <div class="login-input-box" :class="{'actived': isPnFocus}" @click="onPnBoxClick">
                <span class="login-input-digit" v-for="idx in pnMaxLength" :key="idx">{{phoneNumber[idx - 1]}}</span>
            </div>
            <div class="ta-r mg-t-1rem">
                <span v-if="waitSeconds===88" class="tc-mc">正在发送…</span>
                <span v-else-if="waitSeconds > 0" class="tc-66">请{{waitSeconds}}秒再重试</span>
                <a v-else class="tc-b0" @click="onSendSms">获取验证码</a>
            </div>
            <div class="tc-66" :class="{'tc-mc': isVcFocus}">短信验证码</div>
            <div class="login-input-box" :class="{'actived': isVcFocus}" @click="onVcBoxClick">
                <span class="login-input-digit" v-for="idx in vcMaxLength" :key="idx">{{verifyCode[idx - 1]}}</span>
            </div>
            <div class="mg-t-2rem">
                <button type="button" class="btn-box" @click="onSubmit">登 录</button>
            </div>
        </div>
        <div class="fixed-limit-width po-br-0 pd-rem5 ta-c fs-rem7">
            <p><a class="tc-b0" @click="$router.back">返回上一页</a></p>
            <p class="mg-t-rem5">
                <a class="dp-ib tc-b0" @click="gotoPrivacyPolicy">法律条款和隐私政策</a>
                <a class="dp-ib tc-b0 mg-l-rem5" @click="gotoAboutUs">关于我们</a>
                <a class="dp-ib tc-b0 mg-l-rem5" @click="gotoDonatePage">捐助</a>
            </p>
        </div>
    </div>
</template>

<script setup name="LoginIndex">
    import publicAssets from "@/assets/data/publicAssets.js";
    import { onUnmounted, ref } from "vue";
    import { useStore } from "vuex";
    import { useRouter, useRoute } from "vue-router";
    
    const pnMaxLength = 11;
    const vcMaxLength = 6;
    const isPnFocus = ref(false);
    const isVcFocus = ref(false);
    const waitSeconds = ref(0); // 88 正在发送验证码， 1-60 XX秒后重新发送，0-默认状态
    const phoneNumber = ref(""); //手机号码
    const verifyCode = ref(""); //短信验证码
    
    const $store = useStore();
    const $router = useRouter();
    const $route = useRoute();

    let waitTimerID = 0;
    
    function onPnFocus(evt){
        isPnFocus.value = (evt.type === "focus");
        evt.target.value = (isPnFocus.value ? phoneNumber.value : ""); //让光标总是保持在最后一个字符的后面
    }
    function onPnInput(evt){        
        const txt = evt.target.value.toString();
        if(txt.length <= pnMaxLength){
            phoneNumber.value = txt.replace(/[^\d]/gim, "");
        }
        
        if(txt !== phoneNumber.value){
            evt.target.value = phoneNumber.value;
        }
    }
    function onVcFocus(evt){
        isVcFocus.value = (evt.type === "focus");
        evt.target.value = (isVcFocus.value ? verifyCode.value : ""); //让光标总是保持在最后一个字符的后面
    }
    function onVcInput(evt){
        const txt = evt.target.value.toString();
        if(txt.length <= vcMaxLength){
            verifyCode.value = txt.replace(/[^\d]/gim, "");
        }
        
        if(txt !== verifyCode.value){
            evt.target.value = verifyCode.value;
        }
    }
    function onSendSms(){
        if(phoneNumber.value.length !== pnMaxLength){
            return !appToast("请填写手机号码");
        } else {
            return !appToast("功能未开放，暂不可用");
        }
        
        if(waitSeconds.value > 0){
            return;
        } else {
            waitSeconds.value = 88;
        }
        
        setTimeout(() => {//这个定时器模拟发送短信
            waitSeconds.value = 60;
            waitTimerID = setInterval(function(){
                if(--waitSeconds.value <= 0){
                    clearInterval(waitTimerID);
                    waitTimerID = 0;
                }
            }, 1000);
            appToast("短信验证码已发送");
        }, 500);
    }
    function onSubmit(){
        if(phoneNumber.value.length !== pnMaxLength){
            return !appToast("请填写手机号码");
        }
        if(verifyCode.value.length !== vcMaxLength){
            return !appToast("请填写短信验证码");
        }
        
        //登录部分待完成...
        if(phoneNumber.value === "18249944619" && verifyCode.value === "520971"){
            $store.dispatch("setUserInfo", {
                authToken: "iLoveYou971", //令牌信息
                nickName: "火星人", //昵称
                userName: phoneNumber.value, //账号
                avatarUrl: publicAssets.imageAvatarAdmin, //头像URL
            });
            $router.replace($route.query.redirect_url || "/");
        } else {
            appToast("登录失败：验证码不正确");
        }
    }
    function onPnBoxClick(){
        $("#pnInputBox").focus();
    }
    function onVcBoxClick(){
        $("#vcInputBox").focus();
    }
    function onChangeRegion(){
        //待完成
        //$router.push("/test");
    }
    function gotoPrivacyPolicy(){
        $router.push("/privacypolicy");
    }
    function gotoAboutUs(){
        $router.push("/aboutus");
    }
    function gotoDonatePage(){
        $router.push("/donate");
    }
    
    onUnmounted(() => {
        if(waitTimerID){
            clearInterval(waitTimerID);
            console.log("销毁了定时器...");
        }
    })
</script>

<style scoped="scoped">
    .login-input-box{
        position: relative;
        display: flex;
        flex-direction: row;
        text-align: center;
        border: 0.1rem solid #ccc;
        border-radius: 0.5rem;
        margin-top: 0.25rem;
    }
    .login-input-box.actived{
        border-color: var(--main-color);
        background-color: rgba(67, 186, 98, 0.1);
    }
    .login-input-box.actived > .login-input-digit{
        border-color: rgba(67, 186, 98, 0.4);
    }
    .login-input-digit{
        flex: 1;
        height: 2.2rem;
        line-height: 2.2rem;
        font-size: 1rem;
    }
    .login-input-digit:nth-of-type(n + 2){
        border-left: 0.05rem solid #eee;
    }
</style>