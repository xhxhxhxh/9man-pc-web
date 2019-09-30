import common from "@/api/common";

const liveBroadcast = {
    state: {
        rtcRoom: null,
        liveBroadcastData: { // 本地状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
        },
        peerIdList: [], // 当前在线学生id
        liveBroadcastDataCurrent: { // 在线学生的状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
        }
    },
    mutations: {
        // 设置rtcRoom
        setRtcRoom (state, data) {
            state.rtcRoom = data
        },

        // peerIdList
        setPeerIdList (state, data) {
            state.peerIdList = data
            const peerIdList = state.peerIdList
            const audioStatusInLocalStorage = state.liveBroadcastData.audioStatus
            const controlStatusInLocalStorage = state.liveBroadcastData.controlStatus
            const audioStatusInCurrent = {}
            const controlStatusInCurrent = {}
            peerIdList.forEach(id => {
                if (audioStatusInLocalStorage[id]) {
                    audioStatusInCurrent[id] = audioStatusInLocalStorage[id]
                }else {
                    audioStatusInCurrent[id] = 2
                }
                if (controlStatusInLocalStorage[id]) {
                    controlStatusInCurrent[id] = controlStatusInLocalStorage[id]
                }else {
                    controlStatusInCurrent[id] = 2
                }
            })
            state.liveBroadcastDataCurrent.audioStatus = audioStatusInCurrent
            state.liveBroadcastDataCurrent.controlStatus = controlStatusInCurrent
        },

        // 设置audioStatus
        setAudioStatus(state, data) {
            const audioStatus = {...state.liveBroadcastData.audioStatus};
            const audioStatusInCurrent = {...state.liveBroadcastDataCurrent.audioStatus};
            const id = data.id;
            const status = data.status;
            audioStatus[id] = status
            audioStatusInCurrent[id] = status
            state.liveBroadcastDataCurrent.audioStatus = {...audioStatusInCurrent}
            state.liveBroadcastData.audioStatus = {...audioStatus}
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // controlStatus
        setControlStatus(state, data) {
            const controlStatus = {...state.liveBroadcastData.controlStatus};
            const controlStatusInCurrent = {...state.liveBroadcastDataCurrent.controlStatus};
            const id = data.id;
            const status = data.status;
            controlStatus[id] = status
            controlStatusInCurrent[id] = status
            state.liveBroadcastDataCurrent.controlStatus = {...controlStatusInCurrent}
            state.liveBroadcastData.controlStatus = {...controlStatus}
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 读取本地存储
        readLiveBroadcastDataFromLocalStorage(state) {
            const localStorage = common.getLocalStorage('9manLiveBroadcast')
            if (localStorage && !(localStorage instanceof Array)) {
                state.liveBroadcastData = localStorage
            }
        },

        // 写入本地存储
        writeLiveBroadcastDataToLocalStorage(state) {
            common.setLocalStorage('9manLiveBroadcast', state.liveBroadcastData)
        },

        // 全体静音
        updateAudioStatusAll(state) {
            const audioOpenObj = this.getters.updateAudioStatus
            if (audioOpenObj) { // 全部静音
                audioOpenObj.forEach(id => {
                    state.rtcRoom.closeAudio(id);
                    state.liveBroadcastData.audioStatus[id] = 2
                    state.liveBroadcastDataCurrent.audioStatus[id] = 2
                })
                this.commit('writeLiveBroadcastDataToLocalStorage')
            } else { // 取消静音
                const audioCloseObj = state.liveBroadcastDataCurrent.audioStatus
                for (let id in audioCloseObj) {
                    state.rtcRoom.openAudio(id);
                    state.liveBroadcastData.audioStatus[id] = 1
                    state.liveBroadcastDataCurrent.audioStatus[id] = 1
                }
                this.commit('writeLiveBroadcastDataToLocalStorage')
            }
        },

        // 全体操作
        updateControlStatusAll(state) {
            const controlOpenObj = this.getters.controlAllStatus
            const params = {
                type: 'controlStudentOperate',
            }
            const controlCloseObj = state.liveBroadcastDataCurrent.controlStatus
            if (controlOpenObj) { // 全体禁止操作
                Object.assign(params, {status: 2})
                state.rtcRoom.sendMessage(params)
                for (let id in controlCloseObj) {
                    state.liveBroadcastData.controlStatus[id] = 2
                    state.liveBroadcastDataCurrent.controlStatus[id] = 2
                }
            } else { // 全体操作
                Object.assign(params, {status: 1})
                state.rtcRoom.sendMessage(params)
                for (let id in controlCloseObj) {
                    state.liveBroadcastData.controlStatus[id] = 1
                    state.liveBroadcastDataCurrent.controlStatus[id] = 1
                }
            }
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },
    },
    getters: {
        // 更新audioStatus
        updateAudioStatus(state) {
            const audioStatus = state.liveBroadcastDataCurrent.audioStatus;
            let totalCount = 0
            let num = 0
            let audioOpenArr = []
            for (let key in audioStatus) {
                totalCount ++
                if (audioStatus[key] === 1) {
                    num ++
                    audioOpenArr.push(key)
                }
            }
            if (num === 0) {
                return false // 表示全部静音
            }else {
                return audioOpenArr
            }
        },

        // ControlStatus
        updateControlStatus(state) {
            const controlStatus = state.liveBroadcastDataCurrent.controlStatus;
            let totalCount = 0
            let num = 0
            let controlOpenArr = []
            for (let key in controlStatus) {
                totalCount ++
                if (controlStatus[key] === 1) {
                    num ++
                    controlOpenArr.push(key)
                }
            }
            if (num === 0) {
                return false // 表示全体禁止操作
            }else {
                return controlOpenArr
            }
        },

        // 是否为全部操作状态
        controlAllStatus(state) {
            const controlStatus = state.liveBroadcastDataCurrent.controlStatus;
            let totalCount = 0
            let num = 0
            let controlOpenArr = []
            for (let key in controlStatus) {
                totalCount ++
                if (controlStatus[key] === 1) {
                    num ++
                    controlOpenArr.push(key)
                }
            }
            if (num === totalCount) {
                return true // 表示全体操作状态
            }else {
                return false
            }
        },
    }
}

export default liveBroadcast
