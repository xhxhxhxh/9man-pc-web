<template>
    <div class="mikeStatus-container">
        <div>
            <span :class="{active: volume > 0}"></span>
            <span :class="{active: volume > 16}"></span>
            <span :class="{active: volume > 32}"></span>
            <span :class="{active: volume > 48}"></span>
            <span :class="{active: volume > 64}"></span>
            <span :class="{active: volume > 80}"></span>
        </div>
        <button style="display: none" @click="triggerMike" ref="triggerMike"></button>
    </div>
</template>

<script>
    export default {
        name: "MikeStatus",
        data () {
            return {
                volume: 0, // 音量
                context: null, // 声音的内容
            }
        },
        props: ['openMike', 'identity', 'rtcRoom', 'id'],
        mounted() {
            if (this.openMike) {
                if (this.identity === 'others') {
                    this.getVolumeFromOthers()
                }else {
                    this.audio()
                }

            }
        },
        methods: {
            // 捕捉麦克风声音
            audio() {
                navigator.getUserMedia  = navigator.getUserMedia ||
                                          navigator.webkitGetUserMedia ||
                                          navigator.mozGetUserMedia ||
                                          navigator.msGetUserMedia;
                window.AudioContext = window.AudioContext || window.webkitAudioContext
                this.context = new AudioContext();

                // 检测浏览器是否支持
                if (!navigator.getUserMedia) {
                    return this.$message.error('多媒体监听异常,建议使用高版本的谷歌浏览器');
                }
                navigator.getUserMedia({
                    video: false,
                    audio: true
                }, this.onSuccess, this.onError);
            },

            // 获取声音成功的回调
            onSuccess(stream) {
                const audioInput = this.context.createMediaStreamSource(stream);
                // 创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
                const scriptProcessor = this.context.createScriptProcessor(4096,1,1);
                // 将该分析对象与麦克风音频进行连接
                audioInput.connect(scriptProcessor);
                // 此举无甚效果，仅仅是因为解决 Chrome 自身的 bug
                scriptProcessor.connect(this.context.destination);
                // 开始处理音频
                this.$refs.triggerMike.click()
                scriptProcessor.onaudioprocess = (e) => {
                    // 获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
                    let buffer = e.inputBuffer.getChannelData(0);
                    // 获取缓冲区中最大的音量值
                    this.volume = parseInt(Math.max.apply(Math, buffer) * 100);
                }
            },

            // 获取声音失败
            onError(err) {
                console.log(err);
                this.$message.error('麦克风未授权， 请设置浏览器')
            },

            // 主动触发麦克风
            triggerMike() {
                this.context.resume()
            },

            // 获取其他人麦克风音量
            getVolumeFromOthers () {
                this.rtcRoom.on('audio-volume-change', (peerId, volume) => {
                    // console.log('peerId:' + peerId, 'volume:' + volume);
                    if (peerId === this.id) {
                        this.volume = volume * 100
                    }
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .mikeStatus-container {
        width: 33px;
        height: 17px;
        font-size: 0;
        display: inline-block;
        div {
            padding-top: 1px;
        }
        span {
            display: inline-block;
            height: 16px;
            width: 3px;
            background-color: #FECEA8;
            &.active {
                background-color: #FF8A3A;
            }
            &:nth-child(1) {
                & ~ span {
                    margin-left: 3px;
                }
            }
        }
    }
</style>
