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