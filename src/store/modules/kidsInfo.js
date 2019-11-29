import common from "@/api/common";

const userInfo = {
    state: {
        kidsInfo: []
    },
    mutations: {
       setKidsInfo (state, data) {
           state.kidsInfo = data;
           common.setLocalStorage('kidsInfo', data)
       },
       setKidAvatar (state, data) {
           const kidsInfo = state.kidsInfo;
           const kidInfo = kidsInfo.filter(item => item.id == data.id)[0];
           kidInfo.headimg = data.img;
           this.commit('setKidsInfo', state.kidsInfo)
       }
    },
    getters: {
        getKidsInfo (state) {
            return state.kidsInfo;
        }
    }
}

export default userInfo
