// 统一 api 接口

/**************【必读】***************
【注】：
    __RM__ 指 Request Method，如果 URL 尾部不带则默认 GET。
    详情请参考同目录下的 ./index.js 文件下的 commonRequest 函数。

【接口文档 :::: 】
************************************/

export default {
    saveUserSharePics: "/xlttapi?__RM__=POST&action=save_share_pics", //保存用户分享的照片信息
    toggleMyPostStatus: "/xlttapi?__RM__=POST&action=toggle_my_post_status", //将我的帖子设为仅自己可见或全部人可见
    deleteMyPost: "/xlttapi?__RM__=POST&action=delete_my_post", //删除我的帖子
}
