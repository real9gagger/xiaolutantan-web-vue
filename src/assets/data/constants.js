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
export const panoList = [
    {
        id: 0x11,
        thumbPath: "panoramic/panos/pingtang_estuary_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/pingtang_estuary_720.xml",
        title: "平塘江口",
        captureTime: "2022年9月9日",
        lnglat: [109.073873, 22.642090]
    },
    {
        id: 0x22,
        thumbPath: "panoramic/panos/madao_hinge_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/madao_hinge_720.xml",
        title: "马道枢纽",
        captureTime: "2022年9月18日",
        lnglat: [108.944385, 22.378856]
    },
    {
        id: 0x33,
        thumbPath: "panoramic/panos/qishi_hinge_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/qishi_hinge_720.xml",
        title: "企石枢纽",
        captureTime: "2022年9月19日",
        lnglat: [108.942663, 22.322861]
    },
    {
        id: 0x44,
        thumbPath: "panoramic/panos/qingnian_hinge_720_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/qingnian_hinge_720.xml",
        title: "青年枢纽",
        captureTime: "2022年9月20日",
        lnglat: [108.654629, 22.005420]
    },
    {
        id: 0x55,
        thumbPath: "panoramic/panos/shajing_estuary_180_tiles/thumb.jpg",
        scenesXml: "panoramic/scenes/shajing_estuary_180.xml",
        title: "沙井入海口",
        captureTime: "2022年9月27日",
        lnglat: [108.609076, 21.854558]
    }
];