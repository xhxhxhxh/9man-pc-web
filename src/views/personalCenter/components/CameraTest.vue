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
                            <p>1.请插入摄像头 <br>2.请清理或更换USB插孔 <br>3.请更换为手机或平板电脑</p>
                        </div>
                    </div>
                    <div class="authorize" v-if="key === '3'">
                        <div class="advise">
                            <img src="../images/authorize01.png" alt="">
                            <p>左上角点击“允许”使用摄像头权限！</p>
                        </div>
                        <div class="advise">
                            <img src="../images/authorize02.png" alt="">
                            <p>请点击网址前方的“
                                <icon-font type="icon-lock"/>
                                ”标志<br>在设置弹窗中设置摄像头为“允许”后刷新网页！</p>
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
            <p>请将摄像头对准自己，确保上半身能否清楚出现在画面中！</p>
            <div class="video-box">
                <video autoplay loop type="video/*" ref="video"></video>
                <div class="confirm">
                    <p>能看到自己吗？</p>
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
        name: "CameraTest",
        data () {
            return {
                currentIndex: 0,
                transitionName: 'test-slide' // 用于控制组件切换方向
            }
        },
        props: ['data'],
        components: {
            BrowserTest,
            IconFont
        },
        mounted () {
            if (Object.keys(this.data.problems).length === 0) {
                this.video()
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
                navigator.getUserMedia({
                    video: {width: 200, height: 200},
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
                this.$message.error('摄像头未授权， 请设置浏览器')
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
            .video-box {
                display: flex;
                justify-content: center;
                margin-top: 75px;
                video {
                    width: 200px;
                    height: 200px;
                }
                .confirm {
                    margin-left: 50px;
                    width: 160px;
                    p {
                        color: #434343;
                    }
                    button {
                        width:100%;
                        height:46px;
                        border-radius:10px;
                        font-size:18px;
                        color: #fff;
                        &:first-of-type {
                            margin: 30px 0;
                        }
                    }
                }
            }
        }
    }
</style>
