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
    
    //用户分享的照片数据：测试环境可用：sharepics/index.json 文件，必须带时间戳，防止缓存！
    sharePicsData: "sharepics/dataset.json?ts=", 
    pictureMadaoHinge3: "sharepics/madao_hinge_3.jpg",
    picturePlyhMap: "sharepics/plyh_map_thumb.jpg",
    picturePlyhSketch: "sharepics/plyh_sketch.jpg",
    
    //图标
    iconDefaultUserAvatar: "icons/default_user_avatar.png",
    iconLuwuTown: "icons/luwu_town.png",
    iconLuwuTownWhite: "icons/luwu_town_white.png",
    iconMadaoHub: "icons/madao_hub.png",
    iconMadaoHubWhite: "icons/madao_hub_white.png",
    iconMapAdministrativeRegion: "icons/map_administrative_region.png",
    iconMapCalloutHiding: "icons/map_callout_hiding.png",
    iconMapCalloutShowing: "icons/map_callout_showing.png",
    iconMapLocationPosition: "icons/map_location_position.png",
    iconMapLocationGrey: "icons/map_location_grey.png",
    iconMapRestorePerspective: "icons/map_restore_perspective.png",
    iconMapRestoreGrey: "icons/map_restore_grey.png",
    iconMapSatelliteFill: "icons/map_satellite_fill.png",
    iconMapToggleLayers: "icons/map_toggle_layers.png",
    iconPingtangjiangEntrance: "icons/pingtangjiang_entrance.png",
    iconPingtangjiangEntranceWhite: "icons/pingtangjiang_entrance_white.png",
    iconQingnianHub: "icons/qingnian_hub.png",
    iconQingnianHubWhite: "icons/qingnian_hub_white.png",
    iconQinzhouPort: "icons/qinzhou_port.png",
    iconQinzhouPortWhite: "icons/qinzhou_port_white.png",
    iconQishiHub: "icons/qishi_hub.png",
    iconQishiHubWhite: "icons/qishi_hub_white.png",
    iconMyLocation: "icons/my_location.png",
    iconCurrentPositionCity: "icons/current_position_city.png",
    iconMapPinFill: "icons/map_pin_fill.png",
    iconSharePictureMarker: "icons/share_picture_marker.png",
    iconSharePictureActiviting: "icons/share_picture_activiting.png",
    iconSharePictureVisited: "icons/share_picture_visited.png",
    iconCloseXGrey: "icons/close_x_grey.png",
    iconSharePictureRed: "icons/share_picture_red.png",
    iconAddSharePictures: "icons/add_share_pictures.png",
    iconAddSharePicturesGreen: "icons/add_share_pictures_green.png",
    iconAddShareLocation: "icons/add_share_location.png",
    iconAddShareLocationGreen: "icons/add_share_location_green.png",
    iconArrowRight: "icons/arrow_right.png", //原始图标来源：https://www.iconfont.cn/collections/detail?spm=a313x.user_detail.i1.dc64b3430.15ea3a81IdfAL4&cid=599
    iconArrowLeft: "icons/arrow_left.png",
    iconMapPositionPin: "icons/map_position_pin.png",
    iconPoiNoResults: "icons/poi_no_results.png",
    iconCheckV: "icons/check_v.png",
    iconSearchGrey: "icons/search_grey.png",
    iconSearchGreen: "icons/search_green.png",
    iconUpOrDown: "icons/up_or_down.png",
    iconTrashCloseWhite: "icons/trash_close_white.png",
    iconTrashOpenWhite: "icons/trash_open_white.png",
    iconThePostAuthor: "icons/the_post_author.png",
    iconPublishPost: "icons/publish_post.png",
    iconHelpAboutCanal: "icons/help_about_canal.png",
    
    //图片
    imageAppLogo: "images/app_logo.png",
    imageImgError: "images/img_error.png",
    imageImgLost: "images/img_lost.png",
    imageImgReading: "images/img_reading.png",
    imageCanalSegmented: "images/canal_segmented.png",
    imageCanalSingle: "images/canal_single.png",
    imageRegionNone: "images/region_none.png",
    imageRegionShi: "images/region_shi.png",
    imageRegionXian: "images/region_xian.png",
    imageRegionZhen: "images/region_zhen.png",
    imageMapCanalThumbnail: "images/map_canal_thumbnail.png",
    imageServerError: "images/server_error.png",
    imageLoadingGif: "images/loading_gif.svg",
    imageAvatarAdmin: "images/avatar_admin.jpeg",
    imageAvatarPingping: "images/avatar_pingping.jpeg",
    imageAvatarTantan: "images/avatar_tantan.jpeg",
    imageAvatarLulu: "images/avatar_lulu.jpeg",
    imageAboutUsBg: "images/about_us_bg.jpg",
};

if(THE_BU){
    //添加网站根路径前缀
    for(const kk in AssetsPathMap){
        AssetsPathMap[kk] = (THE_BU + AssetsPathMap[kk]);
    }
}

export default AssetsPathMap;