<template>
    <div class="teacherVideo-container">
        <div class="video-area" :style="{width: 308 * teacherVideoScale + 'px', height: 202 * teacherVideoScale + 'px'}">
            <video autoplay :src="src" width="308" height="202" loop type="video/mp4" ref="video"></video>
            <span class="name">李老师</span>
            <div class="status-bar" v-if="hiddenOperate">
                <div class="netStatus">
                    <NetStatus></NetStatus>
                    <span>网络状态</span>
                </div>
                <div class="mikeStatus">
                    <img src="./images/mike.png" alt="">
                    <MikeStatus :openMike="mikeStatus" :identity="identity" :rtcRoom="rtcRoom"></MikeStatus>
                </div>
            </div>
        </div>
        <div class="operate-area" v-if="!hiddenOperate">
            <button @click="() => {$emit('pictureCovered')}"><img src="./images/cover.png" alt="">视频铺满</button>
            <button><img src="./images/mute.png" alt="">全部禁音</button>
            <button><img src="./images/control.png" alt="">全部操作</button>
        </div>
    </div>
</template>

<script>
    // 导入socket
    // const io = require('socket.io-client/dist/socket.io.js')

    // import mp4 from './mp4/chrome.mp4'
    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    export default {
        name: "TeacherVideo",
        data () {
            return {
                src: '',
                mikeStatus: true, // 开启麦克风
                socket: null,
                identity: 'self'
            }
        },
        props: ['teacherVideoScale', 'hiddenOperate', 'mode', 'rtcRoom'],
        components: {
            NetStatus,
            MikeStatus,
        },
        created () {
            if (this.mode === 'student') {
                this.identity = 'others'
            }
        },
        mounted () {
            if (this.mode === 'student') {
                this.getTeacherVideo()
            }else {
                this.video()
            }

        },
        methods: {
            // 初始化
            init () {
                const socket = io('http://localhost:3000'); // 建立websocket连接
                this.socket = socket
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

                return
                let mediaRecorder = new MediaRecorder(stream);
                setInterval(RecordLoop,3000);

                function RecordLoop(){
                    mediaRecorder.stop();
                    mediaRecorder.start();
                }


                mediaRecorder.ondataavailable =  (e) => {
                    const reader = new FileReader();
                    reader.addEventListener("loadend", () => {
                        // const blob = new Blob([reader.result],{type: 'video/mp4'});
                        // this.socket.emit('chat message', blob)
                        const buf = new Uint8Array(reader.result);
                        if(reader.result.byteLength > 0){
                            //console.log(buf.buffer);//加这个判断，是因为有很多数据是空的，这个没有必要发到后台服务器，减轻网络开销，提升性能吧。
                            this.socket.emit('chat message', buf.buffer)
                        }
                    });
                    reader.readAsArrayBuffer(e.data);
                }
                mediaRecorder.start();

            },

            // 获取视频失败
            onError(err) {
                console.log(err);
            },

            // 获取老师摄像头数据
            getTeacherVideo () {
                const video = this.$refs.video
                this.rtcRoom.on('media-receive',(peerId,stream) => {
                    if (peerId === '1') {
                        try {
                            video.srcObject = stream;
                        } catch (error) {
                            video.src = window.URL.createObjectURL(stream);
                        }
                    }
                })
            }

        }
    }
</script>

<style lang="less" scoped>
    .teacherVideo-container {
        .video-area {
            float: left;
            width: 308px;
            height: 202px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            video {
                width: 100%;
                height: 100%;
            }
            .status-bar {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 22px;
                background-color: #fff;
                width: 50%;
                font-size: 13px;
                color: #FF6A04;
                padding: 0 15px;
                transform: scale(2);
                transform-origin: left bottom;
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
            }
        }
        .operate-area {
            margin-left: 20px;
            float: left;
            height: 202px;
            width: 150px;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            button {
                width:100%;
                height:48px;
                background-image:url("images/button-bgc.png");
                border-radius:10px;
                font-size: 21px;
                color: #fff;
                border: 0;
                cursor: pointer;
                outline: unset;
                img {
                    width: 21px;
                    height: 21px;
                    margin-right: 10px;
                }
            }
        }
    }
</style>
