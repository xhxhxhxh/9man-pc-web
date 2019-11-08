<template>
    <div class="sketchpad-container" :id="`sketchpad${id}-container`"
         :style="{width: 308 * studentVideoScale + 'px', height: 202 * studentVideoScale + 'px'}">
        <div class="sketchpad-area">
            <span class="name">{{studentName}}</span>
            <SketchpadForShow :id="id" :offsetValue="offsetValue"></SketchpadForShow>
            <div class="operate-area"
                 :style="{width: 34 * studentVideoScale + 'px', height: 150 * studentVideoScale + 'px',
            top: 16 * studentVideoScale + 'px', right: 13 * studentVideoScale + 'px'}">
                <img draggable="false" :src="muteSrc" alt="" @click="mute">
                <img draggable="false" src="./images/star-stu.png" alt="">
                <img draggable="false" :src="controlSrc" alt="" @click="controlStudentOperate">
            </div>
        </div>
        <div class="status-area">
            <div class="status-bar"
                 :style="{transform: `scale(${studentVideoScale})`, width: `${100 / studentVideoScale}%`}">
                <div class="netStatus">
                    <NetStatus></NetStatus>
                    <span>网络状态</span>
                </div>
                <div class="mikeStatus">
                    <img src="./images/mike.png" alt="">
                    <MikeStatus :openMike="mikeStatus" :identity="identity" :rtcRoom="rtcRoom" :id="id"></MikeStatus>
                </div>
                <div class="star">
                    <img src="./images/star.png" alt="">
                    <span>x8</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    import muteImg from './images/mute-stu.png'
    import cancelMuteImg from './images/mute-cancel-stu.png'
    import controlImg from './images/control-stu.png'
    import cancelControlImg from './images/control-cancel-stu.png'
    import SketchpadForShow from '@/components/liveBroadcast/SketchpadForShow'

    export default {
        name: "Sketchpad",
        data() {
            return {
                mikeStatus: true, // 开启麦克风
                identity: 'others',
                offsetValue: null
            }
        },
        props: ['id', 'studentVideoScale', 'rtcRoom', 'studentName'],
        components: {
            NetStatus,
            MikeStatus,
            SketchpadForShow
        },
        created() {

        },
        mounted() {
            this.getOffsetValue()
        },
        computed: {
            muteSrc () {
                if (this.$store.state.liveBroadcast.liveBroadcastData.audioStatus[this.id] === 1) {
                    return muteImg
                } else {
                    return cancelMuteImg
                }
            },
            controlSrc () {
                if (this.$store.state.liveBroadcast.liveBroadcastData.controlStatus[this.id] === 1) {
                    return controlImg
                } else {
                    return cancelControlImg
                }
            },
        },

        methods: {
            // 控制学生操作
            controlStudentOperate() {
                const {operatePermission, liveBroadcastDataCurrent, teacherId, liveBroadcastData} = this.$store.state.liveBroadcast
                if (!operatePermission) return
                const id = this.id
                const params = {
                    type: 'controlStudentOperate',
                    event: 'single_operations',
                    data: {
                        sync: {
                            page: liveBroadcastData.coursewarePage,
                            type: liveBroadcastData.mode === 'picture'? 1: 0
                        }
                    }
                }
                const controlStatus = liveBroadcastDataCurrent.controlStatus[id]
                const controlOpenStatus = this.$store.getters.updateControlStatus // 处于开启操作的用户数组
                const studentNum = this.peerIdList.length

                const currentOperateUser = controlOpenStatus[0]
                if (currentOperateUser && currentOperateUser !== id) {
                    Object.assign(params.data, {peerId: id})
                    this.$store.commit('setControlStatus', {id: currentOperateUser, status: 2})
                    this.$store.commit('setControlStatus', {id: id, status: 1})
                    this.rtcRoom.sendMessage(params)
                    this.rtcRoom.changeAIControl(id)
                    return
                }

                // if (controlOpenStatus) { // 注释以取消 原切换操作需先取消正获得操作权限学生的权限
                //     const controlOpenStatusCache = [...controlOpenStatus] // 拷贝一个controlOpenStatus
                //     if (controlStatus === 1) { // 禁止操作
                //         // 当controlOpenStatusCache存在这个id时，将其从中剔除
                //         const index = controlOpenStatusCache.indexOf(id)
                //         if (index !== -1) {
                //             controlOpenStatusCache.splice(index, 1)
                //         }
                //     }else if (controlStatus === 2) { // 开启操作
                //         // 当controlOpenStatusCache存在这个id时，将其添加进去
                //         const index = controlOpenStatusCache.indexOf(id)
                //         if (index === -1) {
                //             controlOpenStatusCache.push(id)
                //         }
                //     }
                //     // 当controlOpenStatusCache更新后的长度在1和studentNum之间时操作无效
                //     const lengthOfControlOpenStatusCache = controlOpenStatusCache.length
                //     if (lengthOfControlOpenStatusCache > 1 && lengthOfControlOpenStatusCache < studentNum) return
                // }
                if (controlStatus === 1) { // 禁止操作
                    Object.assign(params.data, {peerId: '0'})
                    this.$store.commit('setControlStatus', {id: id, status: 2})
                    this.rtcRoom.changeAIControl(teacherId)
                }else if (controlStatus === 2) { // 开启操作
                    Object.assign(params.data, {peerId: id})
                    this.$store.commit('setControlStatus', {id: id, status: 1})
                    this.rtcRoom.changeAIControl(id)
                }
                this.rtcRoom.sendMessage(params)
            },

            // 静音
            mute() {
                const id = this.id
                const muteStatus = this.$store.state.liveBroadcast.liveBroadcastDataCurrent.audioStatus[id]
                if (muteStatus === 1) { // 静音
                    this.rtcRoom.closeAudio(id);
                    this.$store.commit('setAudioStatus', {id: id, status: 2})
                }else if (muteStatus === 2) {
                    this.rtcRoom.openAudio(id);
                    this.$store.commit('setAudioStatus', {id: id, status: 1})
                }
            },

            // 获取偏移值
            getOffsetValue() {
                const sketchpad = document.querySelector(`#sketchpad${this.id}-container`);
                const [sketchpadOffsetLeft, sketchpadOffsetTop] = [sketchpad.offsetLeft, sketchpad.offsetTop]
                this.offsetValue = {
                    offsetLeft: sketchpadOffsetLeft,
                    offsetTop: sketchpadOffsetTop
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .sketchpad-container {
        user-select: none;
        border-radius: 20px;
        overflow: hidden;

        .sketchpad-area {
            float: left;
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 20px;
            z-index: 1;

            .operate-area {
                width: 34px;
                height: 150px;
                position: absolute;
                top: 16px;
                right: 13px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                z-index: 2;

                img {
                    width: 100%;
                    cursor: pointer;
                }
            }

            .name {
                display: inline-block;
                text-align: center;
                width: 61px;
                height: 20px;
                color: #fff;
                font-size: 13px;
                background-color: rgba(0, 0, 0, .3);
                border-radius: 10px;
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 2;
            }
        }

        .status-area {
            width: 100%;
            height: 100%;
            position: relative;

            .status-bar {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 22px;
                background-color: #fff;
                width: 100%;
                font-size: 13px;
                color: #FF6A04;
                padding: 0 15px;
                transform-origin: left bottom;
                z-index: 2;

                > div {
                    float: left;
                    height: 100%;
                    display: flex;
                    align-items: center;

                    > div {
                        margin-right: 4px;
                    }
                }

                .mikeStatus {
                    margin-left: 20px;

                    img {
                        height: 17px;
                        margin-right: 4px;
                    }
                }

                .star {
                    float: right;

                    img {
                        height: 17px;
                        margin-right: 3px;
                    }
                }
            }
        }
    }
</style>
