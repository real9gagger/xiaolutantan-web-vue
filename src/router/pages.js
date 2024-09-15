export default [
    {
        path: "/:pathMatch(.*)",
        name: "未知页面",
        redirect: "/e404",
        meta: {}
    },
	{
		path: "/", 
		name: "即将跳转到主页",
		redirect: "/index",//跳转到主页
        meta: {}
	},
    {
    	path: "/error",
    	name: "服务器错误",
    	component: () => import("@/views/error/index"),
    	meta: {}
    },
    {
    	path: "/e404",
    	name: "找不到页面",
    	component: () => import("@/views/error/http404"),
    	meta: {}
    },
    {
    	path: "/test",
    	name: "测试中心",
    	component: () => import("@/views/test/index"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/testmapdev",
    	name: "测试地图开发专用",
    	component: () => import("@/views/test/mapDev"),
    	meta: {
            showPageTitle: true
        }
    },
	{
		path: "/index",
		name: "主页",
		component: () => import("@/views/index/index"),
		meta: {}
	},
    {
    	path: "/map3d",
    	name: "平陆运河",
    	component: () => import("@/views/index/map3d"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/map3dsettings",
    	name: "地图展示设置",
    	component: () => import("@/views/index/map3dDisplaySetting"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/map3ddetails",
    	name: "照片详情",
    	component: () => import("@/views/index/map3dShareDetails"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/map3dpicker",
    	name: "选择地点",
    	component: () => import("@/views/index/map3dPositionPicker"),
    	meta: {
            showPageTitle: true,
            loginRequired: true
        }
    },
    {
    	path: "/imagepreview",
    	name: "预览图片",
    	component: () => import("@/views/index/map3dImagePreview"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/login",
    	name: "用户登录",
    	component: () => import("@/views/login/index"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/privacypolicy",
    	name: "法律条款和隐私政策",
    	component: () => import("@/views/login/privacyPolicy"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/mine",
    	name: "个人中心",
    	component: () => import("@/views/mine/index"),
    	meta: {
            showPageTitle: true,
            loginRequired: true
        }
    },
    {
    	path: "/user",
    	name: "用户中心",
    	component: () => import("@/views/mine/user"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/shareadd",
    	name: "分享照片",
    	component: () => import("@/views/mine/shareAdd"),
    	meta: {
            showPageTitle: true,
            loginRequired: true
        }
    },
    {
    	path: "/userpicker",
    	name: "选择作者",
    	component: () => import("@/views/mine/userPicker"),
    	meta: {
            showPageTitle: true,
            loginRequired: true
        }
    },
    {
    	path: "/aboutcanal",
    	name: "关于平陆运河",
    	component: () => import("@/views/help/aboutCanal"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/aboutus",
    	name: "关于我们",
    	component: () => import("@/views/help/aboutUs"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/donate",
    	name: "捐助",
    	component: () => import("@/views/help/donate"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/panoramiclist",
    	name: "全景景点",
    	component: () => import("@/views/canal/panoramicList"),
    	meta: {
            showPageTitle: true
        }
    },
    {
    	path: "/panoramicview",
    	name: "全景欣赏",
    	component: () => import("@/views/canal/panoramicView"),
    	meta: {
            showPageTitle: true
        }
    },
];