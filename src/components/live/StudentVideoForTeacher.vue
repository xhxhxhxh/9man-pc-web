<template>
    <div class="studentVideo-container">
        <div class="video-area" :id="'video' + id" @mouseenter="showOperateArea = true" @mouseleave="showOperateArea = false">
            <p class="name-box">
                <span class="name">{{studentName}}第三方</span>
                <span class="star">
                    <img src="./images/red_star.png" alt="">
                    <span>12</span>
                </span>
            </p>
            <video autoplay loop type="video/*" ref="video"></video>
            <div :class="{'operate-area': true, show: showOperateArea}">
                <img :src="controlSrc" alt="" @click="controlStudentOperate">
                <img :src="muteSrc" alt="" @click="mute">
                <img :src="starSrc" alt="">
            </div>
        </div>
        <img src="./images/student_bg.png" alt="" class="monkey">
    </div>
</template>

<script>
    import muteImg from './images/mute_black.png'
    import cancelMuteImg from './images/mute.png'
    import controlImg from './images/operate_black.png'
    import cancelControlImg from './images/operate_black.png'
    import star from './images/award.png'
    import cancelStar from './images/award_black.png'

    export default {
        name: "StudentVideo",
        data() {
            return {
                mikeStatus: true, // 开启麦克风
                starSrc: cancelStar,
                showOperateArea: false
            }
        },
        props: ['id', 'rtcRoom', 'studentName', 'peerIdList', 'stream'],
        components: {

        },
        mounted() {

        },
        computed: {
            muteSrc () {
                if (this.$store.state.liveBroadcast.liveBroadcastData.audioStatus[this.id] === 1) {
                    return cancelMuteImg
                } else {
                    return muteImg
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
        watch: {
            stream: function (val) {
                const video = this.$refs.video
                try {
                    video.srcObject = val;
                } catch (error) {
                    video.src = window.URL.createObjectURL(val);
                }
            }
        },

        methods: {

            // 控制学生操作
            controlStudentOperate() {
                const {operatePermission, liveBroadcastDataCurrent, teacherId, liveBroadcastData} = this.$store.state.liveBroadcast
                const mode = liveBroadcastData.mode
                if (!operatePermission && mode !== 'picture') return
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
        }
    }
</script>

<style lang="less" scoped>
    @import "../../less/index";
    .studentVideo-container {
        user-select: none;
        width: 393rem/@baseFontSize;
        height: 240rem/@baseFontSize;
        border-radius: 10rem/@baseFontSize;
        position: relative;

        .monkey {
            position: absolute;
            right: 0;
            top: 38rem/@baseFontSize;
            display: block;
            width: 100rem/@baseFontSize;
        }

        .video-area {
            float: left;
            position: absolute;
            left: 0;
            top: 0;
            width: 320rem/@baseFontSize;
            height: 100%;
            border-radius: 10rem/@baseFontSize;
            z-index: 1;

            video {
                width: 100%;
                height: 100%;
                border-radius: 10rem/@baseFontSize;
            }

            .operate-area {
                height: 60rem/@baseFontSize;
                width: 300rem/@baseFontSize;
                position: absolute;
                left: 50%;
                bottom: 0;
                transform: translate(-50%, 150%);
                transition: all .3s ease;
                display: flex;
                justify-content: space-between;
                &.show {
                    transform: translate(-50%, 0);
                }
                img {
                    display: block;
                    width: 50rem/@baseFontSize;
                    height: 50rem/@baseFontSize;
                    cursor: pointer;
                    border-radius:50%;
                }
            }

            .name-box {
                width: 300rem/@baseFontSize;
                height: 28rem/@baseFontSize;
                line-height: 28rem/@baseFontSize;
                padding: 0 12rem/@baseFontSize;
                position: absolute;
                top: 8rem/@baseFontSize;
                left: 50%;
                transform: translate(-50%, 0);
                background:rgba(0,0,0,.3);
                border-radius:10rem/@baseFontSize;
                font-size:19rem/@baseFontSize;
                color:rgba(255,255,255,1);
                .star {
                    float: right;
                    display: flex;
                    align-items: center;
                    img {
                        vertical-align: bottom;
                        width: 20rem/@baseFontSize;
                        margin-right: 3rem/@baseFontSize;
                    }
                }
            }
        }
    }
</style>
