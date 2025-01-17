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
    updatePostViewCount: "/xlttapi?__RM__=POST&action=update_post_view_count", //更新帖子查看数量
    generateWxSignature: "/xlttapi?__RM__=POST&action=generate_wx_signature", //生成微信签名
    getUserPostList: "/xlttapi?__RM__=GET&action=get_user_post_list", //根据用户ID获取用户发布的帖子
    getAllPostList: "/xlttapi?__RM__=GET&action=get_all_post_list", //获取所有分享的帖子
    getMyPostList: "/xlttapi?__RM__=GET&action=get_my_post_list", //获取我分享的帖子
    getPostById: "/xlttapi?__RM__=GET&action=get_post_by_id", //根据帖子ID获取帖子信息
    getElevationByLatlng: "/xlttapi?__RM__=GET&action=get_elevation_by_latlng", //根据经纬度获取海拔信息
}
