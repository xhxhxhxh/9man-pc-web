import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);
import studentRouter from '@/router/studentRouter'
export default new Vuex.Store({
    state: {
        rootUrl: 'https://edu.9man.com', //https://edu.9man.com
        identity: ''
    },
    mutations: {
        // 设置roles
        setIdentity (state, data) {
            state.identity = data
        }
    },
    actions: {

    },
    getters: {
        roles (state) {
            if (state.identity === '1') {
                return studentRouter.teacher
            } else if (state.identity === '0') {
                return studentRouter.student
            }
        }
    }
})
