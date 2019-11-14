<template>
    <div class="teacherVideo-container">
        <div class="video-area">
            <video autoplay width="308" height="202" loop type="video/mp4" ref="video"></video>
            <span class="name">{{teacherName}}</span>
        </div>
        <div class="operate-area">
            <button @click="() => {$emit('pictureCovered')}" :class="{disable: studentsNum}"><img src="./images/cover.png" alt="">视频铺满</button>
            <button :class="{muteAll: !$store.getters.updateAudioStatus, mute: true}"
                    @click="$store.commit('updateAudioStatusAll')">
                <img :src="muteSrc" alt="">{{muteText}}
            </button>
            <button :class="{controlAll: $store.getters.controlAllStatus, control: true}"
                    @click="$store.commit('updateControlStatusAll')" >
                <img :src="controlSrc" alt="">{{controlText}}
            </button>
        </div>
    </div>
</template>

<script>
    // 导入socket
    // const io = require('socket.io-client/dist/socket.io.js')

    // import mp4 from './mp4/chrome.mp4'
    import muteImg from './images/mute.png'
    import cancelMuteImg from './images/cancel_mute.png'
    import controlImg from './images/control.png'
    import cancelControlImg from './images/control-cancel.png'

    export default {
        name: "TeacherVideo",
        data () {
            return {

            }
        },
        props: ['rtcRoom', 'teacherName', 'peerIdList'],
        created () {

        },
        mounted () {
            this.video()
        },
        computed: {
            muteSrc () {
                if (this.$store.getters.updateAudioStatus) {
                    return muteImg
                }else {
                    return cancelMuteImg
                }
            },
            muteText () {
                if (this.$store.getters.updateAudioStatus) {
                    return '全部静音'
                }else {
                    return '取消静音'
                }
            },
            controlSrc () {
                if (!this.$store.getters.controlAllStatus) {
                    return controlImg
                }else {
                    return cancelControlImg
                }
            },
            controlText () {
                if (!this.$store.getters.controlAllStatus) {
                    return '全部操作'
                }else {
                    return '取消操作'
                }
            },
            // 房间内学生数
            studentsNum () {
                const studentsNum = this.peerIdList.length
                if (studentsNum === 0) {
                    return true
                }else {
                    return false
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
            video () {
                navigator.getUserMedia  = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                // 检测浏览器是否支持
                if (!navigator.getUserMedia) {
                    return this.$message.error('摄像头异常,建议使用高版本的谷歌浏览器');
                }
                this.checkDevice()
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
                this.$message.error('摄像头未授权， 请设置浏览器')
            },

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
                &.mute {
                    &.muteAll {
                        background: #fff;
                        color: #FF6A04;
                    }
                }
                &.control {
                    &.controlAll {
                        background: #fff;
                        color: #FF6A04;
                    }
                }
                &.disable {
                    background: #CDCDCD !important;
                    cursor: unset;
                }
                img {
                    width: 21px;
                    height: 21px;
                    margin-right: 10px;
                }
            }
        }
        @media (max-width: 1550px){
            .operate-area {
                margin-left: 10px;
                width: 120px;
                button {
                    font-size: 18px;
                    img {
                        width: 18px;
                        height: 18px;
                    }
                }
            }
        }
        @media (max-width: 1410px){
            .operate-area {
                margin-left: 5px;
                width: 70px;
                button {
                    font-size: 14px;
                    img {
                        display: none;
                    }
                }
            }
        }
        @media (max-width: 1250px){
            .operate-area {
                margin-left: 5px;
                width: 60px;
            }
        }
    }
</style>
