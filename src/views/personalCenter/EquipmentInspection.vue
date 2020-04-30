<template>
    <div class="equipmentInspection-container">
        <header :class="{abnormal: !status}">
            <div class="left">
                <span :class="{rotate: testing}">
                    <icon-font type="icon-Configurationofreinforcementinspection"/>
                </span>
            </div>
            <div class="middle">
                <p v-show="!testing">{{explanation}}</p>
                <p v-show="testing">正在进行硬件检测，请稍后....</p>
                <div class="progress" v-show="testing">
                    <div :class="{'progress-bar': true, normal: status, abnormal: !status}" :style="{width: progress + '%'}"></div>
                </div>
            </div>
            <div class="right">
                <a-button type="primary" @click="startTesting">{{buttonText}}</a-button>
            </div>
        </header>
        <main>
            <div class="test-item" v-for="item in testList" :key="item.id">
                <div class="status">
                    <icon-font type="icon-lujing" v-show="item.status === 0" style="color: #dcdcdc"/>
                    <icon-font type="icon-huabanfuben" v-show="item.status === 1" style="color: #22cb64"/>
                    <icon-font type="icon-wrong" v-show="item.status === 2" style="color: #ff684c"/>
                    <icon-font type="icon-loading" v-if="item.status === 3" style="color: #22cb64" class="testing"/>
                </div>
                <div class="title">
                    <p>{{item.title}}</p>
                </div>
                <div class="content">
                    <p>{{item.content}}</p>
                </div>
                <div class="result">
                    <span style="color: #595959" v-show="item.status === 0">未检测</span>
                    <span style="color: #22cb64" v-show="item.status === 1">正常</span>
                    <span style="color: #ff684c; cursor: pointer" v-show="item.status === 2" @click="setCurrentTestItem(item)">异常
                        <icon-font type="icon-lujing"/>
                    </span>
                    <span style="color: #22cb64" v-show="item.status === 3">检测中</span>
                </div>
            </div>
        </main>
        <a-modal
                v-model="modelVisible"
                :centered="centered"
                class="test-model"
                width="620"
                :footer="null"
                :maskClosable="closable">
            <div class="title">
                <span v-for="(text, index) in currentTestItem.modelTitle" :key="index">{{text}}</span>
            </div>
            <component :is="currentTestItem.component" :data="currentTestItem"></component>
        </a-modal>
    </div>
</template>

<script>
    import { Icon } from 'ant-design-vue';
    import SystemTest from './components/SystemTest';
    import BrowserTest from './components/BrowserTest';
    import CameraTest from './components/CameraTest';

    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: 'https://at.alicdn.com/t/font_1789749_7qhrn3l949.js',
    });
    // {modelTitle: '摄像头测试', component: 'CameraTest',problems: {1: '摄像头异常,请下载高版本的谷歌浏览器！', 2: '系统未检测到摄像头设备，请尝试以下方法：'}}
    export default {
        name: "EquipmentInspection",
        data () {
            return {
                testing: false, // 正在进行检测
                buttonText: '硬件检测',
                explanation: '如果遇到直播页面异常、看不到视频、听不见声音等问题，建议您进行硬件检测！',
                problemNum: 0, // 一起正常为true
                progress: 0,
                modelVisible: false,
                testAbort: false, // 中止检测
                closable: false,
                centered: true,
                currentTestItem: {}, // 与testList相对应的model
                testList: [ // status 0 未验证  1 验证成功  2 验证失败  3 检测中
                    {id: 1, status: 0, title: '操作系统', content: '检查操作系统版本是否是win7及以上。', methods: 'testSystem',
                        modelTitle: '系统检测', component: 'SystemTest'},
                    {id: 2, status: 0, title: '浏览器版本', content: '检查是否是谷歌chrome浏览器。', methods: 'testBrowser',
                        modelTitle: '浏览器检测', component: 'BrowserTest'},
                    {id: 3, status: 0, title: '摄像头测试', content: '检查摄像头是否正常工作。', methods: 'testCamera',
                        modelTitle: '摄像头检测', component: 'CameraTest', problems: {}},
                ],
                cacheTestList: [] // testList初始状态的深拷贝
            }
        },
        created () {
            this.cacheTestList = JSON.parse(JSON.stringify(this.testList)) // 拷贝testList
        },
        components: {
            IconFont,
            SystemTest,
            BrowserTest,
            CameraTest
        },
        computed: {
            status () { // 表示总的检测状态
                let problemNum = 0
                let status = true
                for (let i = 0; i < this.testList.length; i++) {
                    if (this.testList[i].status === 2) {
                        status = false
                        problemNum++
                    }
                }
                this.problemNum = problemNum
                return status
            }
        },
        methods: {
            // 开始检测
            async startTesting () {
                if (this.testing) {
                    this.buttonText = '硬件检测'
                    this.testAbort = true
                }else {
                    if (this.buttonText === '重新检测') {
                        this.resetTest()
                    }
                    this.testing = true
                    this.testAbort = false
                    this.buttonText = '取消'
                    for (let i = 0; i < this.testList.length; i++) {
                        this.$set(this.testList[i], 'status', 3)
                        const result = await new Promise((resolve, reject) => {
                            setTimeout(() => {
                                if (this.testAbort) {
                                    reject(false)
                                    this.$set(this.testList[i], 'status', 0)
                                    this.testing = false
                                    return
                                }
                                const currentTestItem = this.testList[i]
                                this[currentTestItem.methods](i)
                                this.progress = parseInt((i + 1) / this.testList.length * 100)
                                resolve(true)
                            }, 1000)
                        }).then(resolve => resolve, reject => reject)
                        if (!result) break // 中止检测
                    }
                    this.testing = false
                    this.buttonText = '重新检测'
                    if (!this.status) {
                        this.explanation = this.testAbort ? `检测中断，发现${this.problemNum}个问题，请点击“异常”修复！` :
                            `检测完成，发现${this.problemNum}个问题，请点击“异常”修复！`
                    }else {
                        this.explanation = this.testAbort ? '检测中断，暂未发现问题' : '检测完成，暂未发现问题'
                    }
                }
            },

            setCurrentTestItem (data) {
                this.currentTestItem = data
                this.modelVisible = true
            },

            // 重置检测状态
            resetTest () {
                this.testList = JSON.parse(JSON.stringify(this.cacheTestList))
                this.progress = 0
            },

            // 检测系统
            testSystem (index) {
                const sUserAgent = navigator.userAgent
                const currentTestItem = this.testList[index]
                console.log(sUserAgent, navigator.platform)
                const isWin = (navigator.platform === "Win32") || (navigator.platform === "Windows")
                const systemList = [
                    {name: 'Windows NT 5.0', system: 'Win2000', require: false},
                    {name: 'Windows NT 5.1', system: 'WinXP', require: false},
                    {name: 'Windows NT 5.2', system: 'Win2003', require: false},
                    {name: 'Windows NT 6.0', system: 'WinVista', require: false},
                    {name: 'Windows NT 6.1', system: 'Win7', require: true},
                    {name: 'Windows NT 6.2', system: 'Win8', require: true},
                    {name: 'Windows NT 6.3', system: 'Win8.1', require: true},
                    {name: 'Windows NT 10', system: 'Win10', require: true},
                ]
                if (isWin) {
                    currentTestItem.status = 2
                    currentTestItem.system = 'Win未知'
                    for (let i = 0; i < systemList.length; i++) {
                        const currentSystem = systemList[i]
                        const pattern = new RegExp(currentSystem.name, 'gi')
                        if (pattern.test(sUserAgent)) {
                            if (currentSystem.require){
                                currentTestItem.status = 1
                            }else {
                                currentTestItem.status = 2
                            }
                            currentTestItem.system = currentSystem.system
                            break
                        }
                    }
                }else {
                    currentTestItem.status = 2
                    currentTestItem.system = '非Windows系统'
                }
                this.testList.splice(index, 1, currentTestItem)
            },

            // 检测浏览器
            testBrowser (index) {
                const currentTestItem = this.testList[index]
                const ua = navigator.userAgent.toLowerCase()
                const re = /(msie|firefox|chrome|opera|version|trident|edge).*?([\d.]+)/
                const m = ua.match(re)
                const browser = m[1].replace(/version/, "'safari")
                const ver = m[2]
                const version = parseInt(ver.split('.')[0])
                console.log(browser)
                currentTestItem.browser = browser + ' ' + version
                currentTestItem.status = 2
                currentTestItem.warning = `您的浏览器为${browser}浏览器，无法正常上课，请点击按钮下载谷歌chrome浏览器。`
                if (browser === 'chrome') {
                    if (version <= 22) {
                        currentTestItem.warning = `您的浏览器版本为chrome${version}，无法正常上课，请点击按钮下载最新谷歌chrome浏览器。`
                    }else {
                        currentTestItem.status = 1
                        currentTestItem.warning = `您的浏览器版本为chrome${version}。`
                    }
                }
                this.testList.splice(index, 1, currentTestItem)
            },

            // 检测摄像头
            testCamera (index) {
                const currentTestItem = this.testList[index]
                currentTestItem.problems = {}
                currentTestItem.status = 2

                navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;

                // 检测浏览器是否支持
                if (!navigator.getUserMedia) {
                    currentTestItem.problems['1'] = '摄像头异常,请下载高版本的谷歌浏览器！'
                }else {
                    navigator.getUserMedia({
                        video: {width: 300, height: 225},
                        audio: false
                    }, () => {}, () => {
                    currentTestItem.problems['3'] = '未取得浏览器授权，请尝试以下方法：'
                    });
                }

                // 检测设备是否存在
                if (!this.checkDevice('videoinput')) {
                    currentTestItem.problems['2'] = '系统未检测到摄像头设备，请尝试以下方法：'
                }
                this.testList.splice(index, 1, currentTestItem)
            },

            // 测试设备是否插入
            checkDevice (type) {
                let num = 0
                let result = false
                navigator.mediaDevices.enumerateDevices().then(devices => {
                    devices.forEach(device => {
                        if (device.kind === type) num++
                    });
                    if (num > 0) {
                        result = true
                    }
                }).catch(function (err) {
                    console.log(err)
                })
                return result
            }
        }
    }
</script>

<style lang="less">
    @import "../../less/index.less";
    @keyframes testingRotate {
        from {
            transform: translate(-80%, -50%) rotate(0);
        }
        to {
            transform: translate(-80%, -50%) rotate(360deg);
        }
    }

    @keyframes testingRotate2 {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(-360deg);
        }
    }

    @keyframes progressMove {
        from {
            background-position: -20px 0;
        }
        to {
            background-position: 0 0;
        }
    }

    @keyframes rotating {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .equipmentInspection-container {
        background:rgba(255,255,255,1);
        border-radius:6px;
        overflow: hidden;
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 50px;
            background-color: #f5fefb;
            &.abnormal {
                background-color: #f8f9ef;
                .left {
                    background-color: #fff9e9;
                    span {
                        color: #ffa900;
                    }
                }
            }
            .left {
                width: 80px;
                height: 80px;
                background-color: #e2f8ef;
                border-radius: 50%;
                position: relative;
                span {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 35px;
                    color: #15de6d;
                    transform-origin: 80%;
                    &.rotate {
                        animation: testingRotate 1s linear infinite;
                        i {
                            animation: testingRotate2 1s linear infinite;
                        }
                    }
                }
            }
            .middle {
                width: 650px;
                p {
                    color: #595959;
                    font-size: 18px;
                    margin: 0;
                    line-height: 1;
                }
                .progress {
                    width: 100%;
                    height: 10px;
                    background-color: #ededed;
                    border-radius: 5px;
                    .progress-bar {
                        margin-top: 8px;
                        height: 100%;
                        background-size: 20px 20px;
                        transition: width .3s linear;
                        &.normal {
                            background-color: #28a745;
                            background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
                        }
                        &.abnormal {
                            background-color: #ffa900;
                            background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
                        }
                        animation: progressMove .5s linear infinite;
                    }
                }
            }
            .right {
                button {
                    width: 120px;
                    height: 40px;
                    border-radius: 20px;
                    background-color: #31d16c;
                    color: #fff;
                    font-size: 18px;
                    border: 0;
                    --antd-wave-shadow-color: #31d16c;
                    span {
                        text-shadow: unset;
                    }
                }
            }
        }
        main {
            padding: 30px 80px;
            .test-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                height: 50px;
                p {
                    margin: 0;
                }
                .status {
                    width: 10%;
                    font-size: 24px;
                    .testing {
                        animation: rotating .5s linear infinite;
                    }
                }
                .title {
                    width: 20%;
                    font-weight: bold;
                    color: #898989;
                }
                .content {
                    width: 50%;
                    color: #ababab;
                }
                .result {
                    width: 15%;
                }
            }
        }
    }
    .test-model {
        width: 620px;
        .ant-modal-body {
            padding: 0;
            .title {
                text-align: center;
                padding: 40px 0;
                span {
                    width: 64px;
                    height: 64px;
                    display: inline-block;
                    background-color: @themeColor;
                    font-size:43px;
                    color: #fff;
                    border-radius: 50%;
                }
            }
        }
    }
</style>
