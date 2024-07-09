/*
    这里的资源指的是目录 /public/ 下的资源
    【将资源放在 /public/ 目录下主要是为了小程序也能访问公共资源】
*/

const THE_BU = process.env.BASE_URL;

const AssetsPathMap = {
    //地理信息文件
    geojsonShi: "geojson/shi_geojson.json",
    geojsonXian: "geojson/xian_geojson.json",
    geojsonZhen: "geojson/zhen_geojson.json",
    geojsonZhenUnsimplify: "geojson/zhen_geojson_unsimplify.json", //未压缩的文件
    
    //图标
    iconDefaultUserAvatar: "icons/default_user_avatar.png",
    iconLuwuTown: "icons/luwu_town.png",
    iconMadaoHub: "icons/madao_hub.png",
    iconMapAdministrativeRegion: "icons/map_administrative_region.png",
    iconMapCalloutHiding: "icons/map_callout_hiding.png",
    iconMapCalloutShowing: "icons/map_callout_showing.png",
    iconMapLocationPosition: "icons/map_location_position.png",
    iconMapRestorePerspective: "icons/map_restore_perspective.png",
    iconMapSatelliteFill: "icons/map_satellite_fill.png",
    iconMapToggleLayers: "icons/map_toggle_layers.png",
    iconPingtangjiangEntrance: "icons/pingtangjiang_entrance.png",
    iconQingnianHub: "icons/qingnian_hub.png",
    iconQinzhouPort: "icons/qinzhou_port.png",
    iconQishiHub: "icons/qishi_hub.png",
    
    //图片
    imageAppLogo: "images/app_logo.png",
    imageAppLogo: "images/img_error.png",
};

if(THE_BU){
    //添加网站根路径前缀
    for(const kk in AssetsPathMap){
        AssetsPathMap[kk] = (THE_BU + AssetsPathMap[kk]);
    }
}

export default AssetsPathMap;