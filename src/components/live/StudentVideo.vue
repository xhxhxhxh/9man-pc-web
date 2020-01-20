<template>
    <div class="studentVideo-container" ref="studentVideo">
        <div class="monkey-box">
            <img src="./images/student_bg.png" alt="" class="monkey">
        </div>
        <div class="video-box" ref="videoBox">
            <div class="student-video-area" :id="'studentVideo' + id" @mouseenter="showOperateArea = true" @mouseleave="showOperateArea = false">
                <p class="name-box">
                    <span class="name">{{studentName}}</span>
                    <span class="star">
                    <img src="./images/red_star.png" alt="">
                    <span>12</span>
                </span>
                </p>
                <video autoplay loop type="video/*" ref="video" @dblclick="onStage"></video>
                <div :class="{'operate-area': true, show: showOperateArea}" v-if="role === 'teacher'">
                    <img :src="controlSrc" alt="" @click="controlStudentOperate">
                    <img :src="muteSrc" alt="" @click="mute">
                    <img :src="starSrc" alt="" ref="star" @click="award">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import muteImg from './images/mute_black.png'
    import cancelMuteImg from './images/mute.png'
    import controlImg from './images/operate_black.png'
    import cancelControlImg from './images/operate.png'
    import star from './images/award.png'
    import cancelStar from './images/award_black.png'

    export default {
        name: "StudentVideo",
        data() {
            return {
                starSrc: cancelStar,
                showOperateArea: false,
                stageStatus: false, // 上台状态
            }
        },
        props: ['id', 'rtcRoom', 'studentName', 'peerIdList', 'stream', 'role'],
        components: {

        },
        mounted() {
            if (this.role === 'teacher') {
                this.changeStar()
            }
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
                    return cancelControlImg
                } else {
                    return controlImg
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
                const {allOperation, coursewarePage, mode} = liveBroadcastData
                if (allOperation) {
                    return this.$message.warning('请先关闭全部授权', 5);
                }
                if (!operatePermission) {
                    return this.$message.warning('动画模式下无法开启学生授权', 5);
                }

                // 学生下台
                const videoBoxArr = document.querySelectorAll('.video-box')
                videoBoxArr.forEach(videoBox => {
                    videoBox.className = 'video-box'
                    videoBox.children[0].style.top = ''
                    videoBox.children[0].style.left = ''
                })
                this.$store.commit('updateStageStatusAll', false)

                const id = this.id
                const params = {
                    event: 'single_operations',
                    data: {
                        sync: {
                            page: coursewarePage,
                            type: mode === 'video'? 1: 0
                        }
                    }
                }
                const controlStatus = liveBroadcastDataCurrent.controlStatus[id]
                const controlOpenStatus = this.$store.getters.updateControlStatus // 处于开启操作的用户数组
                const currentOperateUser = controlOpenStatus[0]

                if (currentOperateUser && currentOperateUser !== id) {
                    Object.assign(params.data, {peerId: id})
                    this.$store.commit('setControlStatus', {id: currentOperateUser, status: 2})
                    this.$store.commit('setControlStatus', {id: id, status: 1})
                    this.rtcRoom.sendMessage(params)
                    this.rtcRoom.changeAIControl(id)
                    return
                }

                if (controlStatus === 1) { // 禁止操作
                    Object.assign(params.data, {peerId: ''})
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

            // 学生上台
            onStage() {
                if (this.role !== 'teacher') return
                if (this.$store.getters.updateControlStatus) { // 有学生处于授权状态时不能上台
                    return this.$message.warning('前先关闭学生授权', 5);
                }
                const videoBox = this.$refs.videoBox
                const {liveBroadcastData} = this.$store.state.liveBroadcast
                const {coursewarePage, mode} = liveBroadcastData
                this.stageStatus = !this.stageStatus

                const params = {
                    event: 'single_video',
                    data: {
                        sync: {
                            page: coursewarePage,
                            type: mode === 'video'? 1: 0
                        },
                        peerId: this.id,
                        appear: this.stageStatus
                    }
                }
                this.rtcRoom.sendMessage(params)

                this.$store.commit('setStageStatus', {id: this.id, status: this.stageStatus? 1: 2})
                if (this.stageStatus) {
                    videoBox.classList.add('onStage')
                } else {
                    videoBox.className = 'video-box'
                    videoBox.children[0].style.top = ''
                    videoBox.children[0].style.left = ''
                }
            },

            // 星星变色
            changeStar () {
                const starDom = this.$refs.star
                starDom.onmouseenter = () => {
                    this.starSrc = star
                }
                starDom.onmouseleave = () => {
                    this.starSrc = cancelStar
                }
            },

            // 发放奖励
            award () {
                this.$emit('award', this.id)
            }
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

        .monkey-box {
            position: relative;
            float: right;
            width: 72rem/@baseFontSize;
            height: 100%;
            .monkey {
                position: absolute;
                right: 0;
                top: 38rem/@baseFontSize;
                display: block;
                width: 100rem/@baseFontSize;
            }
        }
        .video-box {
            position: relative;
            float: left;
            width: 320rem/@baseFontSize;
            height: 100%;
            border-radius: 10rem/@baseFontSize;
            background:url("./images/stage.png") no-repeat;
            background-size: cover;
            .student-video-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 10rem/@baseFontSize;
                background-color: rgba(89,89,89,1);
                transition: all .5s ease;
                overflow: hidden;
                transform-style: preserve-3d;

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

            &.onStage {
                .student-video-area {
                    z-index: 100;
                    &.oneStudentOnStage {
                        height: 783rem/@baseFontSize;
                        width: 1044rem/@baseFontSize;
                    }
                    &.moreStudentOnStage {
                        height: 390rem/@baseFontSize;
                        width: 520rem/@baseFontSize;
                    }
                }
            }
        }

    }
</style>
