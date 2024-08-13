// 统一 api 接口

/**************【必读】***************
【注】：
    __RM__ 指 Request Method，如果 URL 尾部不带则默认 GET。
    详情请参考同目录下的 ./index.js 文件下的 commonRequest 函数。

【接口文档 :::: 】
************************************/

export default {
    saveUserSharePics: "/xlttapi?__RM__=POST&action=save_share_pics", //保存用户分享额照片信息
}
