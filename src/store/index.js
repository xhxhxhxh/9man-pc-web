import Vue from 'vue'
import Vuex from 'vuex'
import common from '@/api/common';
import liveBroadcast from './modules/liveBroadcast';
import kidsInfo from './modules/kidsInfo';

Vue.use(Vuex);
import studentRouter from '@/router/studentRouter';

const env = process.env.NODE_ENV;

export default new Vuex.Store({
    modules: {
        liveBroadcast,
        kidsInfo
    },
    state: {
        rootUrl: env === 'production'? 'https://edu.9man.com': '', // https://edu.9man.com
        resourceUrl: env === 'production'? 'https://api.9mankid.com/uploads': '', // https://api.9mankid.com/uploads
        apiUrl: env === 'production'? 'https://api.9mankid.com/api': '', // https://api.9mankid.com/api
        localUrl: env === 'production'? 'https://www.9mankid.com': '',
        emptyRoomUrl: env === 'production'? 'https://www.9mankid.com:8210': '',
        identity: '',
        updateInfo: 0,
        updateUsername: 0,
    },
    mutations: {
        // 设置roles
        setIdentity(state, data) {
            state.identity = data
        },

        // updateInfo
        updateUserInfo(state, url) {
            if (url) {
                const userInfo = common.getLocalStorage('userInfo');
                userInfo.headimg = url;
                common.setLocalStorage('userInfo', userInfo);
            }
            state.updateInfo++;
        },

        // updateUsername
        updateUsername(state, name) {
            if (name) {
                const userInfo = common.getLocalStorage('userInfo');
                userInfo.uname = name;
                common.setLocalStorage('userInfo', userInfo);
            }
            state.updateUsername++;
        },

    },
    actions: {},
    getters: {
        roles(state) {
            if (state.identity === 1) {
                return studentRouter.teacher
            } else if (state.identity === 2 || state.identity === 0 || state.identity === 4) {
                return studentRouter.student
            }
        },

    }
})
