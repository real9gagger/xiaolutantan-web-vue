<template>
    <div class="page-limit-width">
        <div class="content-cage lh-1x8">
            <p class="mg-b-1rem">
                <b>平陆运河</b>是中华人民共和国广西壮族自治区境内的一条运河，北起横州市郁江西津水库平塘江口，南抵钦州港，经灵山县沙坪镇、旧州镇、陆屋镇沿钦江进入北部湾，是一条中国西南地区由西江干流向南入海的江海联运大通道。运河全长134.2公里，全线按内河I级航道标准建设，可通航 5000 吨级船舶。
            </p>
            <p class="mg-tb-1rem">
                运河于2022年3月17日正式立项，同年8月28日正式开工建设，预计于2026年底建成。建成后西南地区货物经平陆运河出海，比经广东珠江口出海缩短内河航程560公里以上。
            </p>
            <p class="mg-tb-1rem">
                广西水系发达，境内的西江西接云贵、东联粤港澳，水运繁忙。但西江水系与广西沿海地区缺少直接联系的水运通道，使得广西长期面临着虽然临海但没有江河通航入海的困局。
            </p>
            <img :src="publicAssets.pictureMadaoHinge3" alt="平陆运河展望图" class="wi-f bd-dd" />
            <p class="ta-c mg-t-rem25">平陆运河展望图</p>
            <img :src="publicAssets.picturePlyhMap" alt="平陆运河地理位置图" class="wi-f mg-t-1rem bd-dd" />
            <p class="ta-c mg-t-rem25">平陆运河地理位置图</p>
            <p class="mg-t-1rem tc-99">最后更新日期：{{lastUpdateTime}}</p>
            <p class="tc-99">图片来源：互联网</p>
        </div>
    </div>
</template>

<script setup name="HelpAboutCanal">
    import { ref } from "vue";
    import publicAssets from "@/assets/data/publicAssets.js";
    
    const lastUpdateTime = ref("2024年9月1日");
</script>

<style scoped="scoped">
</style>