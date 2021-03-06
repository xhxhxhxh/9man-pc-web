<template>
    <div class="studentVideo-container">
        <div class="video-area" :id="'video' + id">
            <span class="name">{{studentName}}</span>
            <video autoplay loop type="video/*" ref="video" v-show="!showPicture" :muted="identity === 'self'"></video>
        </div>
        <div class="status-area">
            <div class="status-bar" v-if="showStudentStatus">
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

    export default {
        name: "StudentVideo",
        data() {
            return {
                mikeStatus: true, // 开启麦克风
                identity: 'self',
            }
        },
        props: ['id', 'studentVideoScale', 'showStudentStatus', 'rtcRoom', 'studentName', 'mode', 'showPicture', 'stream'],
        components: {
            NetStatus,
            MikeStatus,
        },
        created() {
            if (this.mode === 'others') {
                this.identity = 'others'
            }
        },
        mounted() {
            if (this.mode === 'others') {
                // this.getStudentVideo()
            } else {
                this.video()
            }
        },
        computed: {
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
            // 检测设备
            checkDevice() {
                let videoNum = 0,
                    microphoneNum = 0,
                    deviceList = [];
                navigator.mediaDevices.enumerateDevices().then(devices => {
                    devices.forEach(device => {
                        //console.log(device);
                        deviceList.push(device.kind);
                        if (device.kind === "videoinput") videoNum++;
                        if (device.kind === "audioinput") microphoneNum++;
                    });
                    if (videoNum === 0) {
                        this.$message.error('未发现摄像头')
                    }
                    if (microphoneNum === 0) {
                        this.$message.error('未发现麦克风')
                    }

                }).catch(function (err) {
                });
            },

            // 获取摄像头数据
            video() {
                navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                // 检测浏览器是否支持
                if (!navigator.getUserMedia) {
                    return this.$message.error('摄像头异常,建议使用高版本的谷歌浏览器');
                }
                this.checkDevice()
                navigator.getUserMedia({
                    video: {width: 300, height: 225},
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
                this.$message.error('摄像头未授权， 请设置浏览器')
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
                    console.log('peerId' + peerId);
                    if (peerId === this.id) {
                        try {
                            video.srcObject = stream;
                        } catch (error) {
                            video.src = window.URL.createObjectURL(stream);
                        }
                    }
                })
            },
        }
    }
</script>

<style lang="less" scoped>
    .studentVideo-container {
        user-select: none;
        border-radius: 20px 20px 0 0;
        background-image: url("images/background.png");
        background-size: cover;
        padding-top: 75%;
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
                width: 100%;
                height: 100%;
            }

            &.onStage {
                left: 0;
                top: -100%;
                transform: translate(0, -100px) !important;
                border-radius: 20px;
                overflow: hidden;
            }

            &.onStage-big {
                width: 947px;
                height: 710px;
                transform: translate(-50px, -100px);
                border-radius: 20px;
                overflow: hidden;
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
            width: 50%;
            height: 0;
            left: 0;
            bottom: -44px;
            position: relative;
            border-radius: 0 0 10px 10px;
            transform: scale(2);
            transform-origin: left bottom;

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
                border-radius: 0 0 10px 10px;

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
        @media (max-width: 1400px) {
            .video-area {
                &.onStage-big {
                    width: 597px;
                    height: 448px;
                }
            }
        }
        @media (max-width: 1600px) and (min-width: 1400px) {
            .video-area {
                &.onStage-big {
                    width: 704px;
                    height: 528px;
                }
            }
        }
        @media (max-width: 1850px) and (min-width: 1600px) {
            .video-area {
                &.onStage-big {
                    width: 820px;
                    height: 615px;
                }
            }
        }
        @media (max-width: 1600px) {
            .status-area {
                width: 100%;
                bottom: -22px;
                border-radius: 0 0 20px 20px;
                transform: scale(1);
                .status-bar {
                    border-radius: 0 0 20px 20px;
                }
            }
        }
    }
</style>
