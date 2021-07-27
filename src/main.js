import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8080'
// axios.defaults.baseURL = 'http://210.0.0.233:8080'
import '@/icons' // icon

import api from '@/api/index.js'
Vue.prototype.$api = api

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)
Vue.config.productionTip = false
import uploader from 'vue-simple-uploader'
Vue.use(uploader)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
