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
    	meta: {}
    },
    {
    	path: "/testmapdev",
    	name: "测试地图开发专用",
    	component: () => import("@/views/test/mapDev"),
    	meta: {}
    },
	{
		path: "/index",
		name: "主页",
		component: () => import("@/views/index/index"),
		meta: {}
	},
    {
    	path: "/map3d",
    	name: "平陆运河3D视图",
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
    	path: "/login",
    	name: "用户登录",
    	component: () => import("@/views/login/index"),
    	meta: {
            showPageTitle: true
        }
    }
];