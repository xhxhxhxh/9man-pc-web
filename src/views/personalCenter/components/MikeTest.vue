<template>
    <div class="cameraTest-container">
        <div class="no-problem" v-if="Object.keys(data.problems).length > 0">
            <p class="warning">共发现{{Object.keys(data.problems).length}}处错误！</p>
            <transition :name="transitionName" mode="out-in">
                <div class="content" v-for="(key, index) in Object.keys(data.problems)" :key="key" v-if="index === currentIndex">
                    <BrowserTest :data="{warning: data.problems[key]}" v-if="key === '1'"></BrowserTest>
                    <div class="noDevice" v-if="key === '2'">
                        <div class="text"><p>{{data.problems[key]}}</p></div>
                        <div class="advise">
                            <p>1.请插入话筒或带通话功能的耳机 <br>2.请检查是否插入粉色插孔或更换其他USB插孔 <br>3.请更换为手机或平板电脑</p>
                        </div>
                    </div>
                    <div class="authorize" v-if="key === '3'">
                        <div class="advise">
                            <img src="../images/authorize03.png" alt="">
                            <p>左上角点击“允许”使用麦克风权限！</p>
                        </div>
                        <div class="advise">
                            <img src="../images/authorize04.png" alt="">
                            <p>请点击网址前方的“
                                <icon-font type="icon-lock"/>
                                ”标志<br>在设置弹窗中设置麦克风为“允许”后刷新网页！</p>
                        </div>
                    </div>
                </div>
            </transition>
            <div class="index">
            <span v-for="(key, index) in Object.keys(data.problems)" :key="key" @click="switchComponent(index)"
                  :class="{active: index === currentIndex}">{{index + 1}}</span>
            </div>
        </div>
        <div class="test-device" v-else>
            <p>请保持房间安静，不要离电脑太远哦！</p>
            <div class="mike-box">
                <div class="mike-area">
                    <p>请对着麦克风说话吧</p>
                    <div>
                        <span :class="{active: volume > num * 5}" v-for="num in 20" :key="num"></span>
                    </div>
                    <button style="display: none" @click="triggerMike" ref="triggerMike"></button>
                </div>
                <div class="confirm">
                    <p>你可以看到上面的颜色条在跳动吗？</p>
                    <a-button type="primary" @click="confirm(true)">可以</a-button>
                    <a-button type="primary" @click="confirm(false)">不可以</a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import BrowserTest from './BrowserTest';
    import { Icon } from 'ant-design-vue';
    import config from '@/api/config'

    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: config.equipmentInspectionIconSrc,
    });
    export default {
        name: "MikeTest",
        data () {
            return {
                currentIndex: 0,
                transitionName: 'test-slide', // 用于控制组件切换方向
                volume: 0, // 音量
                context: null, // 声音的内容
            }
        },
        props: ['data'],
        components: {
            BrowserTest,
            IconFont
        },
        mounted () {
            if (Object.keys(this.data.problems).length === 0) {
                this.audio()
            }
        },
        methods:{
            switchComponent (index) {
                if (index < this.currentIndex) {
                    this.transitionName = 'test-slide-reverse'
                }else {
                    this.transitionName = 'test-slide'
                }
                this.currentIndex = index
            },

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

            // 确认测试结果
            confirm(status) {
                const result = {status, index: this.data.index}
                this.$emit('afterManualTest', result)
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../../../less/index.less";
    .test-slide-enter {
        transform: translateX(150%);
    }
    .test-slide-leave-to {
        transform: translateX(-150%);
    }
    .test-slide-reverse-enter {
        transform: translateX(-150%);
    }
    .test-slide-reverse-leave-to {
        transform: translateX(150%);
    }
    .test-slide-enter-active, .test-slide-leave-active, .test-slide-reverse-enter-active, .test-slide-reverse-leave-active{
        transition: all .2s ease;
    }
    .cameraTest-container {
        padding-bottom: 35px;
        overflow: hidden;
        .warning {
            font-size: 18px;
            text-align: center;
            color: #ff4d4f;
            margin-bottom: 20px;
        }
        .content {
            padding: 0 40px 40px;
            min-height: 340px;
            .noDevice {
                p {
                    color: #312C2C;
                    font-size: 18px;
                    margin: 0;
                    text-align: center;
                }
                .advise {
                    padding: 40px 0;
                    margin-top: 20px;
                    font-size: 16px;
                    border:2px solid @themeColor;
                    border-radius:20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    p {
                        text-align: unset;
                    }
                }
            }
            .authorize {
                p {
                    color: #312C2C;
                    font-size: 18px;
                    margin: 10px 0;
                    text-align: center;
                    &:last-of-type {
                        margin-bottom: 0;
                    }
                }
                img {
                    width: 300px;
                    vertical-align: middle;
                }
                .advise {
                    text-align: center;
                }
            }
        }
        .index {
            text-align: center;
            span {
                user-select: none;
                display: inline-block;
                line-height: 31px;
                width: 33px;
                height: 33px;
                color: @themeColor;
                border: 1px solid @themeColor;
                border-radius: 50%;
                margin: 0 17px;
                cursor: pointer;
                &.active {
                    color: #fff;
                    background-color: @themeColor;
                }
            }
        }
        .test-device {
            padding-bottom: 35px;
            p {
                color: #312C2C;
                font-size: 18px;
                margin: 0;
                text-align: center;
            }
            .mike-box {
                margin-top: 37px;
                padding: 0 90px;
                .mike-area {
                    border:2px solid @themeColor;
                    border-radius:20px;
                    padding: 16px 0;
                    p {
                        margin: 0 0 20px;
                        font-size:16px;
                        color: @themeColor;
                        text-align: center;
                    }
                    div {
                        display: flex;
                        justify-content: space-evenly;
                    }
                    span {
                        display: inline-block;
                        height: 77px;
                        width: 10px;
                        background-color: #fff;
                        border:1px solid @themeColor;
                        border-radius:5px;
                        &.active {
                            background-color: @themeColor;
                        }
                    }
                }
                .confirm {
                    margin-top: 35px;
                    text-align: center;
                    p {
                        color: #434343;
                        margin-bottom: 35px;
                    }
                    button {
                        width:160px;
                        height:46px;
                        border-radius:10px;
                        font-size:18px;
                        color: #fff;
                        &:first-of-type {
                            margin-right: 55px;
                        }
                    }
                }
            }
        }
    }
</style>
