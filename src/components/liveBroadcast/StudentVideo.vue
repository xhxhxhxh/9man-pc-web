<template>
    <div class="studentVideo-container">
        <div class="video-area" :style="{width: 308 * studentVideoScale + 'px', height: 202 * studentVideoScale + 'px'}">
            <video autoplay  loop type="video/*" :draggable="!draggdisable" ref="video" id="video"
                   v-show="id !== dragVideoId" @dragstart="startDrag" @dragend="endDrag"></video>
            <div class="info-area">
                <span class="name">李老师</span>
                <div class="status-bar" v-if="showStudentStatus" :style="{transform: `scale(${studentVideoScale})`, width: `${100 / studentVideoScale}%`}">
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
                <div class="operate-area" :style="{width: 34 * studentVideoScale + 'px', height: 150 * studentVideoScale + 'px',
            top: 16 * studentVideoScale + 'px', right: 13 * studentVideoScale + 'px'}" v-if="!draggdisable">
                    <img src="./images/mute-stu.png" alt="">
                    <img src="./images/star-stu.png" alt="">
                    <img src="./images/control-stu.png" alt="" @click="controlStudentOperate">
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    // const io = require('socket.io-client/dist/socket.io.js')
    // import mp4 from './mp4/chrome.mp4'
    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    export default {
        name: "StudentVideo",
        data () {
            return {
                // mp4: mp4,
                showVideo: true,
                mikeStatus: true, // 开启麦克风
                control: false,
                identity: 'self'
            }
        },
        props: ['id', 'dragVideoId', 'studentVideoScale', 'showStudentStatus', 'draggdisable', 'mode', 'rtcRoom', 'stream'],
        components: {
            NetStatus,
            MikeStatus,
        },
        created () {
            if (this.mode === 'teacher') {
                this.identity = 'others'
            }
        },
        mounted () {
            if (this.mode === 'teacher') {
                this.getStudentVideo()
                this.identity = 'others'
            }else {
                this.video()
            }
        },
        methods: {
            // 开始拖拽
            startDrag(e) {
                const params = {
                    id: this.id,
                    x: e.offsetX,
                    y: e.offsetY
                }
                this.$emit('startDragVideo',params);
            },

            endDrag() {
                this.$emit('endDragVideo');
            },

            // 获取摄像头数据
            video () {
                navigator.getUserMedia  = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                // 检测浏览器是否支持
                if (!navigator.getUserMedia) {
                    return this.$message.error('摄像头异常,建议使用高版本的谷歌浏览器');
                }
                navigator.getUserMedia({
                    video: {width: 308, height: 202},
                    audio: false
                }, this.onSuccess, this.onError);
            },

            onSuccess(stream) {
                const video = this.$refs.video
                try {
                    video.srcObject = stream;
                } catch (error) {
                    video.src = window.URL.createObjectURL(stream);
                }
            },

            // 获取视频失败
            onError(err) {
                console.log(err);
            },

            // 获取视频数据
            getVideoStream () {
                const socket = io('http://localhost:3000'); // 建立websocket连接
                let i = 0
                const chunk = []
                let flag = false // 播放阀门

                socket.on('chat message', (stream) => {
                    const video = this.$refs.video
                    const buf = new Uint8Array(stream).buffer
                    const blob = new Blob([buf],{type: 'video/mp4'});
                    // const blob = new Blob([stream], {type: 'video/mp4'});
                    chunk.push(blob)
                    if (chunk.length >= 2 && !flag) {
                        flag = true
                        setInterval(function () {
                            const url = window.URL.createObjectURL(chunk[i]);
                            video.src = url
                            i ++
                        }, 3000)
                    }
                })
            },

            // 获取学生摄像头数据
            getStudentVideo () {
                const video = this.$refs.video
                this.rtcRoom.on('media-receive',(peerId,stream) => {
                    console.log('studentVideoId' + this.id);
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
            controlStudentOperate () {
                this.control = !this.control
                const params = {
                    type: 'controlStudentOperate',
                    control: this.control
                }
                this.rtcRoom.sendMessage(params)
            }
        }
    }
</script>

<style lang="less" scoped>
    .studentVideo-container {
        .video-area {
            float: left;
            width: 308px;
            height: 202px;
            border-radius: 20px;

            background-image: url("images/background.png");
            overflow: hidden;
            user-select:none;
            video {
                width: 100%;
                height: 100%;
                float: left;
                position: relative;
                z-index: 1;
            }
            .info-area {
                width: 100%;
                height: 100%;
                position: relative;
            }
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
                background-color: rgba(0,0,0,.3);
                border-radius: 10px;
                position:absolute;
                top: 10px;
                left: 10px;
                z-index: 2;
            }
        }
    }
</style>
