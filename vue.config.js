/**
 * 配置该文件可以参考:
 * https://cli.vuejs.org/zh/config/#%E7%9B%AE%E6%A0%87%E6%B5%8F%E8%A7%88%E5%99%A8
 */
// 基础路径，发布前修改这里,当前配置打包出来的资源都是相对路径
const BASE_PATH = './';
module.exports = {
  publicPath: BASE_PATH, //Vue CLI 3.3 之前的版本，<%= BASE_URL %> 对应的是 vue.config.js中的 publicPath，vue CLI 3.3 之后（包括3.3）的版本，对应的是 baseURl
  lintOnSave: true,
  productionSourceMap: false,
  css: {
    // 忽略 CSS order 顺序警告
    extract: { ignoreOrder: true },
	loaderOptions: {
		sass:{
		    //additionalData:`@import '@/styles/variables.scss';`
		}
	}
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
       args[0].title= '小鹿坦坦';
       return args;
    });
    
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions;
    });
    
    config.module
    .rule('vue')
    .use('vue-loader')
    .tap(options => {
        options.compilerOptions = {
            isCustomElement: tag => ['swiper-container','swiper-slide'].includes(tag)
        };
        return options;
    });
  },
  configureWebpack: {
    plugins: [
      require('unplugin-vue-setup-extend-plus/webpack').default({
        enableAutoExpose: true
      })
    ]
  },
  // 配置转发代理
  devServer: {
    port: 8080,
    proxy: {
      '/xlttapi': {
        target: 'http://localhost:80',
        ws: true,
        pathRewrite: {
          '^/xlttapi': BASE_PATH + 'php/uploader.php'
        },
		changeOrigin: true
      }
    }
  }
}
