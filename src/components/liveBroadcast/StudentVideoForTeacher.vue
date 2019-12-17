<template>
    <div class="studentVideo-container"
         :style="{width: studentVideoScale === 1? '48%': '30%', paddingTop: studentVideoScale === 1? '36%': '22.5%',
         borderRadius: studentVideoScale === 1? '20px 20px 0 0': '20px', overflow: studentVideoScale === 1? 'unset': 'hidden'}">
        <div class="video-area dragStudentVideoCenter dragStudentVideo" :id="'video' + id" draggable="true"
             @dragstart="startDrag" @dragend="endDrag" @drop.stop="videoDropIn" @dragover.prevent="() => {}">
            <span class="name" draggable="false">{{studentName}}</span>
            <video autoplay loop type="video/*" ref="video"></video>
            <div class="operate-area" draggable="false">
                <img draggable="false" :src="muteSrc" alt="" @click="mute">
                <img draggable="false" src="./images/star-stu.png" alt="">
                <img draggable="false" :src="controlSrc" alt="" @click="controlStudentOperate">
            </div>
        </div>
        <div class="status-area">
            <div class="status-bar" v-if="showStudentStatus"
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

    export default {
        name: "StudentVideo",
        data() {
            return {
                mikeStatus: true, // 开启麦克风
                identity: 'others',
            }
        },
        props: ['id', 'studentVideoScale', 'showStudentStatus', 'rtcRoom', 'studentName', 'peerIdList'],
        components: {
            NetStatus,
            MikeStatus,
        },
        mounted() {
            this.getStudentVideo()
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
            // 开始拖拽
            startDrag(e) {
                const params = {
                    id: this.id,
                    x: e.offsetX,
                    y: e.offsetY,
                    target: e.target
                }
                e.dataTransfer.setData('text/html', e.target.id);
                this.$emit('startDragVideo', params);
            },

            endDrag(e) {
                this.$emit('endDragVideo', e.target);
            },

            videoDropIn(e) {
                // 触发父组件dropin
                e.id = this.id
                this.$emit('dropIn', e);
            },

            // 获取视频数据
            getVideoStream() {
                const socket = io('http://localhost:3000'); // 建立websocket连接
                let i = 0
                const chunk = []
                let flag = false // 播放阀门

                socket.on('chat message', (stream) => {
                    const video = this.$refs.video
                    const buf = new Uint8Array(stream).buffer
                    const blob = new Blob([buf], {type: 'video/mp4'});
                    // const blob = new Blob([stream], {type: 'video/mp4'});
                    chunk.push(blob)
                    if (chunk.length >= 2 && !flag) {
                        flag = true
                        setInterval(function () {
                            const url = window.URL.createObjectURL(chunk[i]);
                            video.src = url
                            i++
                        }, 3000)
                    }
                })
            },

            // 获取学生摄像头数据
            getStudentVideo() {
                const video = this.$refs.video
                this.rtcRoom.on('media-receive', (peerId, stream) => {
                    if (peerId === this.id) {
                        try {
                            video.srcObject = stream;
                        } catch (error) {
                            video.src = window.URL.createObjectURL(stream);
                        }
                    }
                })
            },

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
    .studentVideo-container {
        /*@keyframes drag-animate {*/
        /*    to {*/
        /*        top: 116px;*/
        /*        left: 714px;*/
        /*        opacity: 1;*/
        /*        transform: scale(1);*/
        /*    }*/
        /*}*/
        /*@keyframes drag-animate-center {*/
        /*    to {*/
        /*        top: 116px;*/
        /*        left: 748px;*/
        /*        opacity: 1;*/
        /*        transform: scale(1);*/
        /*    }*/
        /*}*/
        user-select: none;
        border-radius: 20px 20px 0 0;
        background-image: url("images/background.png");
        background-size: cover;
        width: 48%;
        padding-top: 36%;
        box-sizing: content-box;
        position: relative;

        .video-area {
            float: left;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 20px 20px 0 0;
            z-index: 1;

            video {
                border-radius: 20px 20px 0 0;
            }

            &.small-video {
                z-index: 999;
                width: 360px;
                height: 270px;
                opacity: 0;
                transform: scale(0);
                border-radius: 20px;

                video {
                    border-radius: 20px;
                }

                &.dragStudentVideo {
                    animation: drag-animate .5s ease;
                    animation-fill-mode: forwards;
                }

                .name {
                    width: 82px;
                    height: 27px;
                    font-size: 16px;
                    top: 13px;
                    left: 13px;
                }
            }

            &.big-video {
                z-index: 999;
                width: 947px;
                height: 710px;
                opacity: 0;
                transform: scale(0);
                border-radius: 20px;

                video {
                    border-radius: 20px;
                }

                &.dragStudentVideoCenter {
                    animation: drag-animate-center .5s ease;
                    animation-fill-mode: forwards;
                }

                .operate-area {
                    display: none;
                }

                .name {
                    width: 82px;
                    height: 27px;
                    font-size: 16px;
                    top: 13px;
                    left: 13px;
                }
            }

            video {
                width: 100%;
                height: 100%;
            }

            .operate-area {
                width: 14%;
                height: 80%;
                position: absolute;
                top: 9%;
                right: 8%;
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
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }

        .status-area {
            width: 100%;
            height: 0;
            position: relative;
            left: 0;
            bottom: -22px;
            border-radius: 0 0 20px 20px;

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
                border-radius: 0 0 20px 20px;
                display: flex;
                justify-content: space-between;

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

        @media (max-width: 1400px){
            .video-area {
                &.small-video {
                    width: 214px;
                    height: 161px;
                }
                &.big-video {
                    width: 564px;
                    height: 423px;
                }
            }
        }

        @media (max-width: 1650px) and (min-width: 1400px){
            .video-area {
                &.small-video {
                    width: 255px;
                    height: 191px;
                }
                &.big-video {
                    width: 672px;
                    height: 504px;
                }
            }
        }

        @media (max-width: 1900px) and (min-width: 1650px){
            .video-area {
                &.small-video {
                    width: 305px;
                    height: 229px;
                }
                &.big-video {
                    width: 803px;
                    height: 602px;
                }
            }
        }

        @media (max-width: 1300px){
            .status-area {
                .status-bar{
                    padding: 0 5px;
                }
            }
        }
    }
</style>
