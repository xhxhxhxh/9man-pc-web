<template>
    <div class="studentVideo-container" ref="studentVideo">
        <div class="monkey-box">
            <img :src="roleInfo? $store.state.resourceUrl + '/' + roleInfo.src: ''" alt="" :class="{monkey: true, move: !!roleInfo}" >
        </div>
        <div ref="videoBox" :class="{'video-box': true, hasJoinedRoom: info.joinRoom, hasConnected: info.isconnect}">
            <div class="student-video-area" :id="'studentVideo' + id" @mouseenter="info.isconnect? showOperateArea = true: ''"
                 @mouseleave="info.isconnect? showOperateArea = false: ''">
                <p class="name-box">
                    <span class="name">{{studentName}}</span>
                    <span class="star">
                        <img src="./images/red_star.png" alt="">
                        <span>{{info.star}}</span>
                    </span>
                </p>
                <video autoplay loop type="video/*" ref="video" @dblclick="onStage" v-show="info.isconnect" :muted="id === studentId"
                       :class="{videoLost: !stream || stream.getVideoTracks().length  === 0, reverse: id === studentId}"></video>
                <div :class="{'operate-area': true, show: showOperateArea && info.isconnect}" v-if="role === 'teacher'">
                    <img :src="controlSrc" alt="" @click="controlStudentOperate">
                    <img :src="muteSrc" alt="" @click="mute">
                    <img :src="starSrc" alt="" ref="star" @mousedown="award">
                </div>
                <div :class="{'move-star-self': true, scale: moveStarScale}" ref="moveStarSelf">
                    <img src="./images/move_star.png" alt="">
                </div>
                <div :class="{'animate-star-self': true, scale: showAnimateStar}" ref="animateStarSelf" v-show="showAnimateStar">
                    <img :src="animateStarSrc" alt="">
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
    import animate_star from './images/animate_star_self.gif'

    export default {
        name: "StudentVideo",
        data() {
            return {
                starSrc: cancelStar,
                showOperateArea: false,
                showAnimateStar: false,
                animateStarSrc: animate_star,
                moveStarScale: false,
                startStarAnimate: false, // 动画节流
                awardButtonStatus: false // 按钮节流
            }
        },
        props: ['id', 'rtcRoom', 'studentName', 'stream', 'role', 'info', 'studentId', 'roleInfo', 'roomId', 'allAwardStatus'],
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
            },
        },

        methods: {
            // 控制学生操作
            controlStudentOperate() {
                const {operatePermission, liveBroadcastDataCurrent, teacherId, liveBroadcastData} = this.$store.state.liveBroadcast
                const {allOperation, coursewarePage} = liveBroadcastData
                if (allOperation) {
                    return this.$message.warning('请先关闭全部授权', 5);
                }
                if (!operatePermission) {
                    return this.$message.warning('动画模式下无法开启学生授权', 5);
                }

                // 学生下台
                const videoBoxArr = document.querySelectorAll('.video-box')
                videoBoxArr.forEach(videoBox => {
                    videoBox.classList.remove('onStage')
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
                            type: 0
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
                    this.$emit('setAlert', {visiable: true, message: `学生 ${this.studentName} 正在操作课件`})
                    return
                }

                if (controlStatus === 1) { // 禁止操作
                    Object.assign(params.data, {peerId: ''})
                    this.$store.commit('setControlStatus', {id: id, status: 2})
                    this.rtcRoom.changeAIControl(teacherId)
                    this.$emit('setAlert', {visiable: false, message: ``})
                }else if (controlStatus === 2) { // 开启操作
                    Object.assign(params.data, {peerId: id})
                    this.$store.commit('setControlStatus', {id: id, status: 1})
                    this.rtcRoom.changeAIControl(id)
                    this.$emit('setAlert', {visiable: true, message: `学生 ${this.studentName} 正在操作课件`})
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
                if (this.$store.getters.updateControlStatus || this.$store.state.liveBroadcast.liveBroadcastData.allOperation) { // 有学生处于授权状态时不能上台
                    return this.$message.warning('前先关闭学生授权', 5);
                }
                const videoBox = this.$refs.videoBox
                const {liveBroadcastData} = this.$store.state.liveBroadcast
                const {coursewarePage, mode} = liveBroadcastData
                const stageStatus = liveBroadcastData.stageStatus[this.id]

                const params = {
                    event: 'single_video',
                    data: {
                        sync: {
                            page: coursewarePage,
                            type: 0
                        },
                        peerId: this.id,
                        appear: stageStatus !== 1
                    }
                }
                this.rtcRoom.sendMessage(params)

                this.$store.commit('setStageStatus', {id: this.id, status: stageStatus === 1? 2: 1})
                if (liveBroadcastData.stageStatus[this.id] === 1) {
                    videoBox.classList.add('onStage')
                } else {
                    videoBox.classList.remove('onStage')
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
                if (this.role === 'teacher' && !this.awardButtonStatus && !this.startStarAnimate && !this.allAwardStatus) {
                    this.awardButtonStatus = true
                    this.$axios.post(this.$store.state.apiUrl + '/v1/classRoomHistory/addClassRoomReward', {room_no: this.roomId, students: this.id})
                        .then(res => {
                            let data = res.data;
                            if (data.code === 200) {
                                const params = {
                                    event: 'single_award',
                                    data: {
                                        peerId: this.id,
                                        sync: {
                                            page: this.$store.state.liveBroadcast.liveBroadcastData.coursewarePage,
                                        },
                                    }
                                }
                                this.rtcRoom.sendMessage(params)
                                this.$emit('setSingleAwardStatus', true)
                                this.starAnimate()
                            }else {
                                this.$message.warning(data.msg)
                            }
                            this.awardButtonStatus = false
                        })
                        .catch(() => {
                            this.awardButtonStatus = false
                        })
                }else {
                    this.$message.warning('请稍后再试', 3)
                }
            },

            // 他人获得奖励动效
            starAnimate () {
                if (this.startStarAnimate) return
                this.startStarAnimate = true

                const starDom = document.querySelector('#studentVideo' + this.id + ' .star img')
                const starParent = starDom.parentElement.parentElement
                const height = starDom.offsetHeight
                const width = starDom.offsetWidth
                const top = starDom.offsetTop + starParent.offsetTop
                const left = starDom.offsetLeft + starParent.offsetLeft - starParent.offsetWidth / 2
                const clientX = left + width / 2
                const clientY = top + height / 2
                const moveStar = this.$refs.moveStarSelf
                const _this = this
                this.showAnimateStar = true
                this.moveStarScale = false
                moveStar.style.left = ''
                moveStar.style.top = ''
                moveStar.style.transform = ''
                _this.animateStarSrc = animate_star

                setTimeout(() => {
                    this.showAnimateStar = false
                    moveStar.style.transition = 'all .5s ease'
                    moveStar.style.visibility = 'unset'
                    moveStar.style.left = clientX + 'px'
                    moveStar.style.top = clientY + 'px'
                    moveStar.style.transform = `translate(-50%, -50%) scale(0) rotate(1080deg)`
                    moveStar.addEventListener('transitionend', transitionend)
                }, 700)

                function transitionend() {
                    moveStar.removeEventListener('transitionend', transitionend)
                    moveStar.style.transition = ''
                    moveStar.style.visibility = ''
                    _this.$emit('addStar', {id: _this.id, star: _this.info.star})
                    setTimeout(() => {
                        _this.startStarAnimate = false
                        _this.$emit('setSingleAwardStatus', false)
                    }, 1600)
                    _this.moveStarScale = true
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../../less/index";

    @keyframes animal-move {
        50% {
            transform: translate(0, 0);
        }
        75% {
            transform: translate(0, 0) scale(0.8);
        }
        100% {
            transform: translate(0, 0) scale(1);
        }
    }

    @keyframes star-scale {
        from {
            transform: translate(-50%, 50%) scale(0);
        }
        to {
            transform: translate(-50%, 50%) scale(1);
        }
    }

    @keyframes star-scale2 {
        from {
            transform: translate(-50%, -50%) scale(0) rotate(1080deg);
            visibility: unset;
        }
        to {
            transform: translate(-50%, -50%) scale(0.3) rotate(1080deg);
        }
    }

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
                transform: translate(-100%, 0);
                left: 0;
                top: 38rem/@baseFontSize;
                display: block;
                width: 100rem/@baseFontSize;
                &.move {
                    animation: animal-move 1s forwards;
                }
            }
        }
        .video-box {
            position: relative;
            float: left;
            width: 320rem/@baseFontSize;
            height: 100%;
            border-radius: 10rem/@baseFontSize;
            background:url("./images/not_enter.png") no-repeat;
            background-size: cover;
            &.hasJoinedRoom {
                background:url("./images/leave.png") no-repeat;
                background-size: cover;
            }
            &.hasConnected {
                background:url("./images/stage.png") no-repeat;
                background-size: cover;
            }

            .student-video-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 10rem/@baseFontSize;
                transition: all .5s ease;
                overflow: hidden;
                transform-style: preserve-3d;

                .move-star-self {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    height: 95rem/@baseFontSize;
                    width: 100rem/@baseFontSize;
                    transform: translate(-50%, -50%) scale(1);
                    z-index: 99;
                    visibility: hidden;
                    &.scale {
                        animation: star-scale2 0.3s;
                    }
                    img {
                        display: block;
                        height: 100%;
                    }
                }
                .animate-star-self {
                    position: absolute;
                    left: 50%;
                    bottom: 50%;
                    transform: translate(-50%, 50%);
                    height: 180rem/@baseFontSize;
                    width: 300rem/@baseFontSize;
                    z-index: 99;
                    img {
                        display: block;
                        height: 100%;
                    }
                    &.scale {
                        animation: star-scale 0.1s;
                        animation-fill-mode: forwards;
                    }
                }

                video {
                    width: 100%;
                    height: 100%;
                    border-radius: 10rem/@baseFontSize;
                    background-color: #595959;
                    &.videoLost {
                        background:url("./images/video_lost.png") no-repeat;
                        background-size: cover;
                        &.reverse {
                            transform: unset;
                        }
                    }
                    &.reverse {
                        transform: scale(-1, 1);
                    }
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
