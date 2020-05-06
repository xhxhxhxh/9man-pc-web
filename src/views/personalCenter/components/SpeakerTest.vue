<template>
    <div class="speakerTest-container">
        <div class="no-problem" v-if="Object.keys(data.problems).length > 0">
            <p class="warning">共发现{{Object.keys(data.problems).length}}处错误！</p>
            <transition :name="transitionName" mode="out-in">
                <div class="content" v-for="(key, index) in Object.keys(data.problems)" :key="key" v-if="index === currentIndex">
                    <BrowserTest :data="{warning: data.problems[key]}" v-if="key === '1'"></BrowserTest>
                    <div class="noDevice" v-if="key === '2'">
                        <div class="text"><p>{{data.problems[key]}}</p></div>
                        <div class="advise">
                            <p>1.请连接音箱/耳机 <br>2.请清理或更换USB插孔 <br>3.请更换为手机或平板电脑</p>
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
            <p>请调大电脑音量哦！</p>
            <div class="speaker-box">
                <icon-font type="icon-speaker"/>
                <p>你可以清晰地听到音乐吗？</p>
                <audio src="https://www.9mankid.com/music/test.mp3" ref="audio" loop></audio>
                <img :src="playSrc" alt="" @click="playAudio">
                <div class="confirm">
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
    import config from '@/api/config';
    import play from '../images/play.png';
    import pause from '../images/pause.png';

    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: config.equipmentInspectionIconSrc,
    });

    export default {
        name: "SpeakerTest",
        data () {
            return {
                currentIndex: 0,
                transitionName: 'test-slide', // 用于控制组件切换方向
                playSrc: play
            }
        },
        props: ['data'],
        components: {
            BrowserTest,
            IconFont
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

            // 确认测试结果
            confirm(status) {
                const result = {status, index: this.data.index}
                this.$emit('afterManualTest', result)
            },

            playAudio () {
                const audio = this.$refs.audio
                if (audio.paused) {
                    this.playSrc = pause
                    audio.play()
                }else {
                    this.playSrc = play
                    audio.pause()
                }
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
    .speakerTest-container {
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
            .speaker-box {
                text-align: center;
                position: relative;
                img {
                    display: block;
                    position: absolute;
                    cursor: pointer;
                    left: 50%;
                    top: 90px;
                    transform: translate(-50%, -50%);
                }
                i {
                    font-size: 175px;
                    color: @themeColor;
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
