<template>
    <div class="cameraTest-container">
        <p class="warning">共发现{{Object.keys(data.problems).length}}处错误！</p>
        <transition name="test-slide" mode="out-in">
            <div class="content" v-for="(key, index) in Object.keys(data.problems)" :key="key" v-if="index === currentIndex">
                <BrowserTest :data="{warning: data.problems[key]}" v-if="key === '1'"></BrowserTest>
                <div class="noDevice" v-if="key === '2'">
                    <div class="text"><p>{{data.problems[key]}}</p></div>
                    <div class="advise">
                        <p>1.请插入摄像头 <br>2.请清理或更换USB插孔 <br>3.请更换为手机或平板电脑</p>
                    </div>
                </div>
            </div>
        </transition>
        <div class="index">
            <span v-for="(key, index) in Object.keys(data.problems)" :key="key" @click="currentIndex = index"
                  :class="{active: index === currentIndex}">{{index + 1}}</span>
        </div>
    </div>
</template>

<script>
    import BrowserTest from './BrowserTest';
    export default {
        name: "CameraTest",
        data () {
            return {
                currentIndex: 0
            }
        },
        props: ['data'],
        components: {
            BrowserTest
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
    .test-slide-enter-active, .test-slide-leave-active{
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
            height: 300px;
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
    }
</style>
