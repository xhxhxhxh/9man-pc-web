import common from "@/api/common";

const liveBroadcast = {
    state: {
        rtcRoom: null,
        liveBroadcastData: { // 本地状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
            stageStatus: {id: '', videoType: ''}, // 学生上台状态
            mode: '', // 缓存操作模式
            coursewarePage: 0,
        },
        peerIdList: [], // 当前在线学生id
        liveBroadcastDataCurrent: { // 在线学生的状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
        },
        teacherId: '',
        studentId: '',
        operatePermission: true, // 允许学生操作权限
        allOperation: false
    },
    mutations: {
        // 设置rtcRoom
        setRtcRoom (state, data) {
            state.rtcRoom = data
        },

        // 设置老师id
        setTeacherId (state, id) {
            state.teacherId = id
        },

        // 设置全部状态
        setAllOperationStatus (state, status) {
            state.allOperation = status
        },

        // 设置学生上台状态
        setStageStatus (state, data) {
            state.liveBroadcastData.stageStatus = data
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置mode
        setMode (state, value) {
            state.liveBroadcastData.mode = value
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置课件页数
        setCoursewarePage (state, page) {
            state.liveBroadcastData.coursewarePage = page
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置操作权限
        setOperatePermission (state, permission) {
            state.operatePermission = permission
            if (!permission) { // 取消处于操作学生的操作
                const updateControlStatus = this.getters.updateControlStatus
                if (updateControlStatus) {
                    const studentId = updateControlStatus[0]
                    const data = {id: studentId, status: 2}
                    this.commit('setControlStatus', data)
                    const params = {
                        type: 'controlStudentOperate',
                        status: 2,
                        event: 'single_operations',
                        data: {peerId: 0}
                    }
                    state.rtcRoom.sendMessage(params, studentId)
                }
            }
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
            // state.liveBroadcastDataCurrent.audioStatus[id] = status
            // state.liveBroadcastData.audioStatus[id] = status
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
            // state.liveBroadcastData.controlStatus[id] = status
            // state.liveBroadcastDataCurrent.controlStatus[id] = status
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 读取本地存储
        readLiveBroadcastDataFromLocalStorage(state) {
            const localStorage = common.getLocalStorage('9manLiveBroadcast')
            if (localStorage) {
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
                event: 'all_operations',
                data: {
                    sync: {
                        page: state.liveBroadcastData.coursewarePage,
                        type: state.liveBroadcastData.mode === 'picture'? 1: 0
                    }
                }
            }
            const controlCloseObj = state.liveBroadcastDataCurrent.controlStatus
            if (controlOpenObj) { // 全体禁止操作
                Object.assign(params.data, {peerId: '0', isOperations: false})
                for (let id in controlCloseObj) {
                    state.liveBroadcastData.controlStatus[id] = 2
                    state.liveBroadcastDataCurrent.controlStatus[id] = 2
                }
                state.rtcRoom.changeAISyncStatus(true);
            } else { // 全体操作
                Object.assign(params.data, {peerId: 'all', isOperations: true})
                for (let id in controlCloseObj) {
                    state.liveBroadcastData.controlStatus[id] = 1
                    state.liveBroadcastDataCurrent.controlStatus[id] = 1
                }
                state.rtcRoom.changeAISyncStatus(false);
            }
            state.rtcRoom.sendMessage(params)
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
