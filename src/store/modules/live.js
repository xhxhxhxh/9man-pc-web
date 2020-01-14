import common from "@/api/common";

const live = {
    state: {
        rtcRoom: null,
        liveData: { // 本地状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
            stageStatus: {id: '', videoType: ''}, // 学生上台状态
            mode: '', // 缓存操作模式
            coursewarePage: 0,
            allOperation: false
        },
        peerIdList: [], // 当前在线学生id
        liveDataCurrent: { // 当前在线学生的状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
        },
        teacherId: '',
        studentId: '',
        operatePermission: true, // 允许学生操作权限
        setOperatePermissionComplete: true // 确保operatePermission设置完成
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

        // 设置全部授权状态
        setAllOperationStatus (state, status) {
            state.liveData.allOperation = status
            this.commit('updateControlStatusAll', status)
        },

        // 设置学生上台状态
        setStageStatus (state, data) {
            state.liveData.stageStatus = data
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置mode
        setMode (state, value) {
            state.liveData.mode = value
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置课件页数
        setCoursewarePage (state, page) {
            state.liveData.coursewarePage = page
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置操作权限
        setOperatePermission (state, permission) {
            state.operatePermission = permission
        },

        // peerIdList
        setPeerIdList (state, data) {
            state.peerIdList = data
            const peerIdList = state.peerIdList
            const audioStatusInLocalStorage = state.liveData.audioStatus
            const controlStatusInLocalStorage = state.liveData.controlStatus
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
            state.liveDataCurrent.audioStatus = audioStatusInCurrent
            state.liveDataCurrent.controlStatus = controlStatusInCurrent
        },

        // 设置audioStatus
        setAudioStatus(state, data) {
            const audioStatus = {...state.liveData.audioStatus};
            const audioStatusInCurrent = {...state.liveDataCurrent.audioStatus};
            const id = data.id;
            const status = data.status;
            audioStatus[id] = status
            audioStatusInCurrent[id] = status
            state.liveDataCurrent.audioStatus = {...audioStatusInCurrent}
            state.liveData.audioStatus = {...audioStatus}
            // state.liveDataCurrent.audioStatus[id] = status
            // state.liveData.audioStatus[id] = status
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // controlStatus
        setControlStatus(state, data) {
            const controlStatus = {...state.liveData.controlStatus};
            const controlStatusInCurrent = {...state.liveDataCurrent.controlStatus};
            const id = data.id;
            const status = data.status;
            controlStatus[id] = status
            controlStatusInCurrent[id] = status
            state.liveDataCurrent.controlStatus = {...controlStatusInCurrent}
            state.liveData.controlStatus = {...controlStatus}
            // state.liveData.controlStatus[id] = status
            // state.liveDataCurrent.controlStatus[id] = status
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 读取本地存储
        readLiveBroadcastDataFromLocalStorage(state) {
            const localStorage = common.getLocalStorage('9manLiveBroadcast')
            if (localStorage) {
                state.liveData = localStorage
            }
        },

        // 写入本地存储
        writeLiveBroadcastDataToLocalStorage(state) {
            common.setLocalStorage('9manLiveBroadcast', state.liveData)
        },

        // 全体静音
        updateAudioStatusAll(state) {
            const audioOpenObj = this.getters.updateAudioStatus
            if (audioOpenObj) { // 全部静音
                audioOpenObj.forEach(id => {
                    state.rtcRoom.closeAudio(id);
                    state.liveData.audioStatus[id] = 2
                    state.liveDataCurrent.audioStatus[id] = 2
                })
                this.commit('writeLiveBroadcastDataToLocalStorage')
            } else { // 取消静音
                const audioCloseObj = state.liveDataCurrent.audioStatus
                for (let id in audioCloseObj) {
                    state.rtcRoom.openAudio(id);
                    state.liveData.audioStatus[id] = 1
                    state.liveDataCurrent.audioStatus[id] = 1
                }
                this.commit('writeLiveBroadcastDataToLocalStorage')
            }
        },

        // 全体操作
        updateControlStatusAll(state, status) {
            const params = {
                event: 'all_operations',
                data: {
                    sync: {
                        page: state.liveData.coursewarePage,
                        type: state.liveData.mode === 'video'? 1: 0
                    },
                    operations: status
                }
            }
            const controlCloseCurrentObj = state.liveDataCurrent.controlStatus
            const controlCloseObj = state.liveData.controlStatus

            if (!status) { // 全体禁止操作
                for (let id in controlCloseObj) { // 全部禁止时需将连接过本教室的所有学生禁止
                    controlCloseObj[id] = 2
                    controlCloseCurrentObj[id]? controlCloseCurrentObj[id] = 2: ''
                }
                state.rtcRoom.changeAISyncStatus(true);
            } else { // 全体操作
                for (let id in controlCloseCurrentObj) {
                    controlCloseObj[id] = 1
                    controlCloseCurrentObj[id] = 1
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
            const audioStatus = state.liveDataCurrent.audioStatus;
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
            const controlStatus = state.liveDataCurrent.controlStatus;
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
            const controlStatus = state.liveDataCurrent.controlStatus;
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

export default live
