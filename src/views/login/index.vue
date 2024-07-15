<template>
    <div class="bg-f0 of-h us-n">
        <!-- 两个隐藏的输入框 -->
        <input id="pnInputBox" type="tel" class="ps-f po-tl-0 op-0 zi-10"
            :maxlength="pnMaxLength" 
            @focus="onPnFocus" 
            @blur="onPnFocus"
            @input="onPnInput" />
        <input id="vcInputBox" type="number" class="ps-f po-tl-0 op-0"
            :maxlength="vcMaxLength" 
            @focus="onVcFocus" 
            @blur="onVcFocus"
            @input="onVcInput" />
        <div class="hi-cwh pd-1rem bg-ff fs-rem8" style="max-width:500px;margin:0 auto;">
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
                <button class="btn-box" @click="onSubmit">登 录</button>
            </div>
        </div>
        <div class="ps-f po-blr-0 pd-rem5 ta-c fs-rem7">
            <p><a class="tc-b0" @click="$router.back">返回上一页</a></p>
            <p class="mg-t-rem5"><a class="tc-b0">《法律条款和隐私政策》</a></p>
        </div>
    </div>
</template>

<script setup name="LoginIndex">
    import { onUnmounted, ref } from "vue";
    import { useRouter } from "vue-router";
    
    const pnMaxLength = 11;
    const vcMaxLength = 6;
    const isPnFocus = ref(false);
    const isVcFocus = ref(false);
    const waitSeconds = ref(0); // 88 正在发送验证码， 1-60 XX秒后重新发送，0-默认状态
    const phoneNumber = ref(""); //手机号码
    const verifyCode = ref(""); //短信验证码
    const $router = useRouter();
    
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
        
        //待完成
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