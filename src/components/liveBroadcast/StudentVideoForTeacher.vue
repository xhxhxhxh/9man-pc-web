<template>
    <div class="studentVideo-container"
         :style="{width: 308 * studentVideoScale + 'px', height: 202 * studentVideoScale + 'px'}">
        <div class="video-area dragStudentVideoCenter dragStudentVideo" :id="'video' + id" draggable="true"
             @dragstart="startDrag" @dragend="endDrag" @drop.stop="videoDropIn" @dragover.prevent="() => {}">
            <span class="name" draggable="false">{{studentName}}</span>
            <video autoplay loop type="video/*" ref="video"></video>
            <div class="operate-area" :style="{width: 34 * studentVideoScale + 'px', height: 150 * studentVideoScale + 'px',
            top: 16 * studentVideoScale + 'px', right: 13 * studentVideoScale + 'px'}" draggable="false">
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
                const id = this.id
                const params = {
                    type: 'controlStudentOperate',
                }
                const controlStatus = this.$store.state.liveBroadcast.liveBroadcastDataCurrent.controlStatus[id]
                const controlOpenStatus = this.$store.getters.updateControlStatus // 处于开启操作的用户数组
                const studentNum = this.peerIdList.length

                if (controlOpenStatus) {
                    const controlOpenStatusCache = [...controlOpenStatus] // 拷贝一个controlOpenStatus
                    if (controlStatus === 1) { // 禁止操作
                        // 当controlOpenStatusCache存在这个id时，将其从中剔除
                        const index = controlOpenStatusCache.indexOf(id)
                        if (index !== -1) {
                            controlOpenStatusCache.splice(index, 1)
                        }
                    }else if (controlStatus === 2) { // 开启操作
                        // 当controlOpenStatusCache存在这个id时，将其添加进去
                        const index = controlOpenStatusCache.indexOf(id)
                        if (index === -1) {
                            controlOpenStatusCache.push(id)
                        }
                    }
                    // 当controlOpenStatusCache更新后的长度在1和studentNum之间时操作无效
                    const lengthOfControlOpenStatusCache = controlOpenStatusCache.length
                    if (lengthOfControlOpenStatusCache > 1 && lengthOfControlOpenStatusCache < studentNum) return
                }
                if (controlStatus === 1) { // 禁止操作
                    Object.assign(params, {status: 2})
                    this.$store.commit('setControlStatus', {id: id, status: 2})
                }else if (controlStatus === 2) { // 开启操作
                    Object.assign(params, {status: 1})
                    this.$store.commit('setControlStatus', {id: id, status: 1})
                }
                this.rtcRoom.sendMessage(params, id)
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
        @keyframes drag-animate {
            to {
                top: 116px;
                left: 718px;
                opacity: 1;
                transform: scale(1);
            }
        }
        @keyframes drag-animate-center {
            to {
                top: 116px;
                left: 752px;
                opacity: 1;
                transform: scale(1);
            }
        }
        user-select: none;
        border-radius: 20px;
        overflow: hidden;
        background-image: url("images/background.png");

        .video-area {
            float: left;
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 20px;
            z-index: 1;

            &.small-video {
                position: absolute;
                z-index: 999;
                width: 414px;
                height: 271px;
                opacity: 0;
                transform: scale(0);

                &.dragStudentVideo {
                    animation: drag-animate .5s ease;
                    animation-fill-mode: forwards;
                }

                .operate-area {
                    width: 46px !important;
                    height: 202px !important;
                    top: 21px !important;
                    right: 17px !important;
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
                position: absolute;
                z-index: 999;
                width: 1084px;
                height: 710px;
                opacity: 0;
                transform: scale(0);

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
