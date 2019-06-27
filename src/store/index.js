import Vue from 'vue'
import Vuex from 'vuex'
import common from '@/api/common';
Vue.use(Vuex);
import studentRouter from '@/router/studentRouter';
import avatarImg from '@/assets/avatar.png';

export default new Vuex.Store({
    state: {
        rootUrl: '', //https://edu.9man.com
        identity: '',
        updateInfo: 0,
        updateUsername: 0,
    },
    mutations: {
        // 设置roles
        setIdentity (state, data) {
            state.identity = data
        },

        // updateInfo
        updateUserInfo (state, url) {
            if (url) {
                const userInfo = common.getLocalStorage('userInfo');
                userInfo.headimg = url;
                common.setLocalStorage('userInfo', userInfo);
            }
            state.updateInfo ++;
        },

        // updateUsername
        updateUsername (state, name) {
            if (name) {
                const userInfo = common.getLocalStorage('userInfo');
                userInfo.uname = name;
                common.setLocalStorage('userInfo', userInfo);
            }
            state.updateUsername ++;
        },

    },
    actions: {

    },
    getters: {
        roles (state) {
            if (state.identity === '1') {
                return studentRouter.teacher
            } else if (state.identity === '2' || state.identity === '0') {
                return studentRouter.student
            }
        },

        userInfo (state) {
            const updateInfo = state.updateInfo;
            const userInfo = common.getLocalStorage('userInfo');
            if (!userInfo.headimg) {
                return avatarImg
            } else {
                return userInfo.headimg
            }
        },

        //更新后的名字
        username (state) {
            const updateUsername = state.updateUsername;
            const userInfo = common.getLocalStorage('userInfo');
            return userInfo.uname
        },
    }
})
