import Vue from 'vue';
import router from './router/router';
import store from './store';

import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style


NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['login', 'register'] // no redirect whitelist

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  next()
  // if (Vue.ls.get(ACCESS_TOKEN)) {
  //   /* has token */
  //   if (to.path === '/user/login') {
  //     next({ path: '/dashboard/workplace' })
  //     NProgress.done()
  //   } else {
  //
  //   }
  // } else {
  //   if (whiteList.includes(to.name)) {
  //     // 在免登录白名单，直接进入
  //     next()
  //   } else {
  //     next({ path: '/user/login', query: { redirect: to.fullPath } })
  //     NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
  //   }
  // }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
