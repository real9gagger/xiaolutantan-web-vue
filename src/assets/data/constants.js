//展示的行政区域：REGION_NONE（无）、REGION_SHI（市）、REGION_XIAN（县）、REGION_ZHEN（镇）
export const administrativeRegion = {
    REGION_NONE: 0x0000,
    REGION_SHI: 0x1100,
    REGION_XIAN: 0x2200,
    REGION_ZHEN: 0x3300
};

//单条显示运河还是分段显示运河，或者不显示
export const canalDisplayMode = {
    NOT_DISPLAY: 0xFFFF,
    NORMAL_DISPLAY: 0x0000,
    SEGMENTED_DISPLAY: 0xFF00,
};

//地图图层类型
export const mapLayerType = {
    NORMAL: 0x0000,
    MINIMALISM: 0x1111,
    TOPOGRAPHIC: 0x2222,
    SATELLITE: 0x3333
};

//小程序主色
export const appMainColor = "#43BA62";

//小程序网页版名称
export const appWebName = "小鹿坦坦";

//上传状态码
export const uploadStatusCode = {
    unactived: -0x1, //未在上传
    waiting: 0x0, //等待上传
    uploading: 0x1, //正在上传
    success: 0x64, //上传成功
    failed: -0x5124, //上传失败
};

//捐助说明语
export const donateWords = "您的捐款将帮助我们持续改善和发展";

//联系邮箱
export const contactEmail = "3259833818@qq.com";

//全景图片列表（2024年9月19日：目前无数据库，暂时写死，后面如果有新的全景图，需要手工添加）
//可去 https://www.720yun.com 搜索关于 “平陆运河” 的全景图
export const panoList = [
    {
        id: 0x11,
        thumbPath: "panoramic/panos/pingtang_estuary_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/pingtang_estuary_720.xml",
        title: "平塘江口",
        captureTime: "2022/9/9",
        sourceUrl: "https://www.720yun.com/t/f2vk6edy5rm?scene_id=99822377",
        lnglat: [109.073873, 22.642090]
    },
    {
        id: 0x22,
        thumbPath: "panoramic/panos/madao_hinge_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/madao_hinge_720.xml",
        title: "马道枢纽",
        captureTime: "2022/9/18",
        sourceUrl: "https://www.720yun.com/t/e6vk6edyp8q?scene_id=99822487",
        lnglat: [108.944385, 22.378856]
    },
    {
        id: 0x33,
        thumbPath: "panoramic/panos/qishi_hinge_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/qishi_hinge_720.xml",
        title: "企石枢纽",
        captureTime: "2022/9/19",
        sourceUrl: "https://www.720yun.com/t/34vk6edyp7y?scene_id=99822525",
        lnglat: [108.942663, 22.322861]
    },
    {
        id: 0x44,
        thumbPath: "panoramic/panos/qingnian_hinge_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/qingnian_hinge_720.xml",
        title: "青年枢纽",
        captureTime: "2022/9/20",
        sourceUrl: "https://www.720yun.com/t/03vk6edyp77?scene_id=99822534",
        lnglat: [108.654629, 22.005420]
    },
    {
        id: 0x55,
        thumbPath: "panoramic/panos/shajing_estuary_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/shajing_estuary_720.xml",
        title: "沙井入海口",
        captureTime: "2022/9/27",
        sourceUrl: "https://www.720yun.com/t/81vk6edypp9?scene_id=99822570",
        lnglat: [108.609076, 21.854558]
    },
    {
        id: 0x66,
        thumbPath: "panoramic/panos/qinzhou_port_360_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/qinzhou_port_360.xml",
        title: "钦州港",
        captureTime: "2022/9/28",
        sourceUrl: "https://www.720yun.com/t/1bvk67d7pqq?scene_id=104973495",
        lnglat: [108.591074, 21.739349]
    }
];