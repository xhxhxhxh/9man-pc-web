import common from "@/api/common";

const liveBroadcast = {
    state: {
        rtcRoom: null,
        liveBroadcastData: { // 本地状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
            stageStatus: {}, // 学生上台状态
            studentIdList: [], // 进入过房间的学生ID
            videoProgress: {}, // 视频进度
            mode: '', // 缓存操作模式
            coursewarePage: 0,
            allOperation: false,
            roomId: ''
        },
        peerIdList: [], // 当前在线学生id
        liveBroadcastDataCurrent: { // 当前在线学生的状态缓存
            audioStatus: {}, // 静音
            controlStatus: {}, // 操作
            stageStatus: {}, // 学生上台状态
        },
        teacherId: '',
        studentId: '',
        operatePermission: true, // 允许学生操作权限
        stageStatusSortByStage: [] // 根据学生上台次序排序
    },
    mutations: {
        // 设置rtcRoom
        setRtcRoom (state, data) {
            state.rtcRoom = data
        },

        // 设置roomId
        setRoomId (state, data) {
            state.liveBroadcastData.roomId = data
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置videoProgress
        setVideoProgress (state, data) {
            const index = data.index
            const progress = data.progress
            const noSave = data.noSave
            state.liveBroadcastData.videoProgress[index] = progress
            if (!noSave) {
                this.commit('writeLiveBroadcastDataToLocalStorage')
            }
        },

        // 设置老师id
        setTeacherId (state, id) {
            state.teacherId = id
        },

        // 设置全部授权状态
        setAllOperationStatus (state, status) {
            state.liveBroadcastData.allOperation = status
            this.commit('updateControlStatusAll', status)
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

        // 设置studentIdList
        setStudentIdList (state, data) {
            state.liveBroadcastData.studentIdList = data
            this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置操作权限
        setOperatePermission (state, permission) {
            state.operatePermission = permission
        },

        // 设置上台的学生
        setStageStatusSortByStage (state, arr) {
            if (arr.length === 0) {
                state.stageStatusSortByStage = []
            }else {
                const stageStatusSortByStage = state.stageStatusSortByStage
                for (let id of state.liveBroadcastData.studentIdList) {
                    if (arr.indexOf(id) === -1 || stageStatusSortByStage.indexOf(id) !== -1) continue
                    stageStatusSortByStage.push(id)
                }
            }
        },

        // 学生离线重置状态
        resetStatus (state, id) {
            const audioStatus = state.liveBroadcastDataCurrent.audioStatus
            const controlStatus = state.liveBroadcastDataCurrent.controlStatus
            const stageStatus = state.liveBroadcastDataCurrent.stageStatus
            delete audioStatus[id]
            delete controlStatus[id]
            delete stageStatus[id]
            state.liveBroadcastData.audioStatus = {...audioStatus}
            state.liveBroadcastData.controlStatus = {...controlStatus}
            state.liveBroadcastData.stageStatus = {...stageStatus}
            const index = state.stageStatusSortByStage.indexOf(id)
            if (index !== -1) {
                state.stageStatusSortByStage.splice(index, 1)
            }
        },

        // peerIdList
        setPeerIdList (state, data) {
            state.peerIdList = data
            const peerIdList = state.peerIdList
            const audioStatusInLocalStorage = state.liveBroadcastData.audioStatus
            const controlStatusInLocalStorage = state.liveBroadcastData.controlStatus
            const stageStatusInLocalStorage = state.liveBroadcastData.stageStatus
            const audioStatusInCurrent = {}
            const controlStatusInCurrent = {}
            const stageStatusInCurrent = {}
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
                if (stageStatusInLocalStorage[id]) {
                    stageStatusInCurrent[id] = stageStatusInLocalStorage[id]
                }else {
                    stageStatusInCurrent[id] = 2
                }
            })
            state.liveBroadcastDataCurrent.audioStatus = audioStatusInCurrent
            state.liveBroadcastDataCurrent.controlStatus = controlStatusInCurrent
            state.liveBroadcastDataCurrent.stageStatus = stageStatusInCurrent
        },

        // 设置audioStatus
        setAudioStatus(state, data) {
            const audioStatus = {...state.liveBroadcastData.audioStatus};
            const audioStatusInCurrent = {...state.liveBroadcastDataCurrent.audioStatus};
            const id = data.id;
            const status = data.status;
            audioStatus[id] = status
            audioStatusInCurrent[id] = status
            state.liveBroadcastDataCurrent.audioStatus = audioStatusInCurrent
            state.liveBroadcastData.audioStatus = audioStatus
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
            state.liveBroadcastDataCurrent.controlStatus = controlStatusInCurrent
            state.liveBroadcastData.controlStatus = controlStatus
            // state.liveBroadcastData.controlStatus[id] = status
            // state.liveBroadcastDataCurrent.controlStatus[id] = status
            // this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 设置学生上台状态
        setStageStatus (state, data) {
            const stageStatus = {...state.liveBroadcastData.stageStatus};
            const stageStatusInCurrent = {...state.liveBroadcastDataCurrent.stageStatus};
            const id = data.id;
            const status = data.status;
            stageStatus[id] = status
            stageStatusInCurrent[id] = status
            const index = state.stageStatusSortByStage.indexOf(id)
            if (index !== -1) {
                state.stageStatusSortByStage.splice(index, 1)
            }
            if (status === 1) {
                state.stageStatusSortByStage.push(id)
            }
            state.liveBroadcastDataCurrent.stageStatus = stageStatusInCurrent
            state.liveBroadcastData.stageStatus = stageStatus
        },

        // 读取本地存储
        readLiveBroadcastDataFromLocalStorage(state, roomId) {
            const localStorage = common.getLocalStorage('9manLiveBroadcast')
            if (!localStorage) return
            const localRoomId = localStorage.roomId
            if (roomId !== localRoomId) { // 不相同房间则不读取存储
                window.localStorage.removeItem('9manLiveBroadcast')
                return
            }
            // 重置部分内容
            localStorage.controlStatus = {}
            localStorage.stageStatus = {}
            localStorage.allOperation = false
            state.liveBroadcastData = localStorage
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
        updateControlStatusAll(state, status) {
            const params = {
                event: 'all_operations',
                data: {
                    sync: {
                        page: state.liveBroadcastData.coursewarePage,
                        type: state.liveBroadcastData.mode === 'video'? 1: 0
                    },
                    operations: status
                }
            }
            const controlCloseCurrentObj = {...state.liveBroadcastDataCurrent.controlStatus}
            const controlCloseObj = {...state.liveBroadcastData.controlStatus}

            for (let id in controlCloseCurrentObj) {
                controlCloseObj[id] = 2
                controlCloseCurrentObj[id] = 2
            }
            if (!status) { // 全体禁止操作
                // for (let id in controlCloseCurrentObj) {
                //     controlCloseObj[id] = 2
                //     controlCloseCurrentObj[id] = 2
                // }
                state.rtcRoom.changeAISyncStatus(1);
            } else { // 全体操作
                // for (let id in controlCloseCurrentObj) {
                //     controlCloseObj[id] = 1
                //     controlCloseCurrentObj[id] = 1
                // }
                state.rtcRoom.changeAISyncStatus(0);
            }
            state.liveBroadcastDataCurrent.controlStatus = controlCloseCurrentObj
            state.liveBroadcastData.controlStatus = controlCloseObj
            state.rtcRoom.sendMessage(params)
            // this.commit('writeLiveBroadcastDataToLocalStorage')
        },

        // 全体上台
        updateStageStatusAll(state, stageAllStatus) {
            const params = {
                event: 'all_video',
                data: {
                    sync: {
                        page: state.liveBroadcastData.coursewarePage,
                        type: state.liveBroadcastData.mode === 'video'? 1: 0
                    },
                    video: stageAllStatus
                }
            }
            const stageCurrentObj = state.liveBroadcastDataCurrent.stageStatus
            const stageObj = state.liveBroadcastData.stageStatus
            const stageStatusSortByStage = state.stageStatusSortByStage

            if (!stageAllStatus) { // 全体取消上台
                if (stageStatusSortByStage.length <= 0) return
                for (let id in stageCurrentObj) {
                    stageObj[id] = 2
                    stageCurrentObj[id] = 2
                }
                state.stageStatusSortByStage = []
            } else { // 全体上台
                for (let id of state.liveBroadcastData.studentIdList) {
                    if (!stageCurrentObj[id] || stageStatusSortByStage.indexOf(id) !== -1) continue
                    stageObj[id] = 1
                    stageCurrentObj[id] = 1
                    stageStatusSortByStage.push(id)
                }
            }
            state.rtcRoom.sendMessage(params)
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
            let num = 0
            let controlOpenArr = []
            for (let key in controlStatus) {
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

        // 当前上台学生的id
        // stageStatus(state) {
        //     const stageStatus = state.liveBroadcastDataCurrent.stageStatus;
        //     let num = 0
        //     let stageArr = []
        //     for (let key in stageStatus) {
        //         if (stageStatus[key] === 1) {
        //             num ++
        //             stageArr.push(key)
        //         }
        //     }
        //     if (num === 0) {
        //         return false // 表示全体禁止操作
        //     }else {
        //         return stageArr
        //     }
        // },

        // 是否为全部上台状态
        stageAllStatus(state) {
            const stageStatus = state.liveBroadcastDataCurrent.stageStatus;
            let totalCount = 0
            let num = 0
            let stageArr = []
            for (let key in stageStatus) {
                totalCount ++
                if (stageStatus[key] === 1) {
                    num ++
                    stageArr.push(key)
                }
            }
            if (num === totalCount && totalCount !== 0) {
                return true
            }else {
                return false
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
