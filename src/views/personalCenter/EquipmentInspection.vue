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
                    <icon-font type="icon-wrong" v-show="item.status === 2 || item.status === 4" style="color: #ff684c"/>
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
                    <span style="color: #ff684c; cursor: pointer" v-show="item.status === 2 || item.status === 4" @click="setCurrentTestItem(item)">
                        {{item.status === 2 ? '异常': '手动测试'}}
                        <icon-font type="icon-lujing"/>
                    </span>
                    <span style="color: #22cb64" v-show="item.status === 3">检测中</span>
                </div>
            </div>
            <div class="check-result">
                <a-button size="large" @click="checkResult">查看结果</a-button>
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
            <component :is="currentTestItem.component" :data="currentTestItem" @afterManualTest="afterManualTest"></component>
        </a-modal>
        <a-modal
                v-model="resultModelVisible"
                :centered="centered"
                class="result-model test-model"
                width="620"
                :footer="null"
                :maskClosable="closable">
            <div class="title">
                <span v-for="(text, index) in '检测报告'" :key="index">{{text}}</span>
            </div>
            <p :class="{error: !status}">{{status ? '恭喜！你的设备检测已通过，可以正常上课了' : '很遗憾，你的设备检测没有通过'}}</p>
            <div class="content">
                <div class="result-item" v-for="item in testList" :key="item.id">
                    <div class="result-title">
                        <span>{{item.resultTitle}}</span>
                    </div>
                    <div class="detail">
                        <span>{{item.system || item.browser || ''}}</span>
                    </div>
                    <div class="status">
                        <icon-font :type="item.status === 1 ? 'icon-huabanfuben' : 'icon-wrong2'" :class="{error: item.status !== 1}"/>
                        <span :class="{error: item.status !== 1}">{{item.status === 1 ? '正常' : '异常'}}</span>
                    </div>
                </div>
            </div>
            <div class="btn-box">
                <a-button @click="resultModelVisible = false" type="primary">关闭</a-button>
            </div>
        </a-modal>
    </div>
</template>

<script>
    import { Icon } from 'ant-design-vue';
    import SystemTest from './components/SystemTest';
    import BrowserTest from './components/BrowserTest';
    import CameraTest from './components/CameraTest';
    import MikeTest from './components/MikeTest';
    import SpeakerTest from './components/SpeakerTest';
    import config from '@/api/config';
    import common from '@/api/common';

    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: config.equipmentInspectionIconSrc,
    });
    // {modelTitle: '摄像头测试', component: 'CameraTest',problems: {1: '摄像头异常,请下载高版本的谷歌浏览器！',
    // 2: '系统未检测到摄像头设备，请尝试以下方法：', 3: '未取得浏览器授权，请尝试以下方法：'}}
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
                resultModelVisible: false,
                testAbort: false, // 中止检测
                closable: false,
                centered: true,
                testComplete: false,
                currentTestItem: {}, // 与testList相对应的model
                testList: [ // status 0 未验证  1 验证成功  2 验证失败  3 检测中  4 需手动测试
                    {id: 1, status: 0, title: '操作系统', resultTitle: '操作系统', content: '检查操作系统版本是否是win7及以上。', methods: 'testSystem',
                        modelTitle: '系统检测', component: 'SystemTest'},
                    {id: 2, status: 0, title: '浏览器版本', resultTitle: '浏览器', content: '检查是否是谷歌chrome浏览器。', methods: 'testBrowser',
                        modelTitle: '浏览器检测', component: 'BrowserTest'},
                    {id: 3, status: 0, title: '摄像头测试', resultTitle: '摄像头', content: '检查摄像头是否正常工作。', methods: 'testCamera',
                        modelTitle: '摄像头检测', component: 'CameraTest', problems: {}},
                    {id: 4, status: 0, title: '麦克风测试', resultTitle: '麦克风', content: '检查麦克风是否正常工作。', methods: 'testMike',
                        modelTitle: '麦克风检测', component: 'MikeTest', problems: {}},
                    {id: 5, status: 0, title: '扬声器测试', resultTitle: '扬声器', content: '检查扬声器是否正常工作。', methods: 'testSpeaker',
                        modelTitle: '扬声器检测', component: 'SpeakerTest', problems: {}},
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
            CameraTest,
            MikeTest,
            SpeakerTest
        },
        computed: {
            status () { // 表示总的检测状态
                let problemNum = 0
                let status = true
                for (let i = 0; i < this.testList.length; i++) {
                    if (this.testList[i].status === 2 || this.testList[i].status === 4) {
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
                            setTimeout(async () => {
                                if (this.testAbort) {
                                    reject(false)
                                    this.$set(this.testList[i], 'status', 0)
                                    this.testing = false
                                    return
                                }
                                const currentTestItem = this.testList[i]
                                await this[currentTestItem.methods](i)
                                this.progress = parseInt((i + 1) / this.testList.length * 100)
                                resolve(true)
                            }, 1000)
                        }).then(resolve => resolve, reject => reject)
                        if (!result) break // 中止检测
                    }
                    this.testing = false
                    this.buttonText = '重新检测'
                    this.setExplanation()
                    if (!this.testAbort) {
                        this.testComplete = true
                        common.setLocalStorage('equipmentInspection', true)
                    }
                }
            },

            // 设置测试结果的文字内容
            setExplanation () {
                if (!this.status) {
                    this.explanation = this.testAbort ? `检测中断，发现${this.problemNum}个问题，请点击“异常”修复！` :
                        `检测完成，发现${this.problemNum}个问题，请点击“异常”修复！`
                }else {
                    this.explanation = this.testAbort ? '检测中断，暂未发现问题' : '检测完成，暂未发现问题'
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
                this.testComplete = false
            },

            // 检测系统
            testSystem (index) {
                const sUserAgent = navigator.userAgent
                const currentTestItem = this.testList[index]
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
                let browser = m[1].replace(/version/, "'safari")
                let ver = m[2]
                let version = parseInt(ver.split('.')[0])
                let isEdge = false

                // 判断edge浏览器
                if (ua.includes('edge')) {
                    isEdge = true
                    browser = 'edge'
                    version = parseInt(ua.match(/(edge).*?([\d.]+)/)[2].split('.')[0])
                }

                currentTestItem.browser = browser + ' ' + version
                currentTestItem.status = 2
                currentTestItem.warning = `您的浏览器为${browser}浏览器，无法正常上课，请点击按钮下载谷歌chrome浏览器。`
                if (browser === 'chrome' && !isEdge) {
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
                return new Promise(async (resolve, reject) => {
                    const currentTestItem = {...this.testList[index]}
                    currentTestItem.problems = {}
                    currentTestItem.status = 2
                    currentTestItem.index = index
                    let haveProblem = false

                    navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

                    // 检测浏览器是否支持
                    if (!navigator.getUserMedia) {
                        haveProblem = true
                        currentTestItem.problems['1'] = '摄像头异常,请下载高版本的谷歌浏览器！'
                        reject('浏览器不支持')
                    }else {
                        await new Promise((resolve2, reject2) => {
                            navigator.getUserMedia({
                                video: {width: 300, height: 225},
                                audio: false
                            }, () => {console.log('success'); resolve2();resolve()}, (err) => {
                                console.log(err.name)
                                haveProblem = true
                                if (err.name === 'NotFoundError') {
                                    currentTestItem.problems['2'] = '系统未检测到摄像头设备，请尝试以下方法：'
                                    reject2('未发现设备')
                                    reject('未发现设备')
                                }else {
                                    currentTestItem.problems['3'] = '未取得浏览器授权，请尝试以下方法：'
                                    reject2('未授权')
                                    reject('未授权')
                                }
                            });
                        }).catch(err => {
                            console.log(err)
                        })
                    }

                    // 检测设备是否存在(改从getUserMedia识别)
                    // if (!await this.checkDevice('videoinput')) {
                    //     haveProblem = true
                    //     currentTestItem.problems['2'] = '系统未检测到摄像头设备，请尝试以下方法：'
                    //     reject('未发现设备')
                    // }

                    if (!haveProblem) {
                        currentTestItem.status = 4
                    }
                    this.testList.splice(index, 1, currentTestItem)
                }).catch(err => {
                    console.log(err)
                })
            },

            // 检测麦克风
            testMike (index) {
                return new Promise(async (resolve, reject) => {
                    const currentTestItem = {...this.testList[index]}
                    currentTestItem.problems = {}
                    currentTestItem.status = 2
                    currentTestItem.index = index
                    let haveProblem = false

                    navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

                    // 检测浏览器是否支持
                    if (!navigator.getUserMedia) {
                        haveProblem = true
                        currentTestItem.problems['1'] = '麦克风异常,请下载高版本的谷歌浏览器！'
                        reject('浏览器不支持')
                    }else {
                        await new Promise((resolve2, reject2) => {
                            navigator.getUserMedia({
                                video: false,
                                audio: true
                            }, () => {console.log('success'); resolve2();resolve()}, (err) => {
                                console.log(err.name)
                                haveProblem = true
                                if (err.name === 'NotFoundError') {
                                    currentTestItem.problems['2'] = '系统未检测到麦克风设备，请尝试以下方法：'
                                    reject2('未发现设备')
                                    reject('未发现设备')
                                }else {
                                    currentTestItem.problems['3'] = '未取得浏览器授权，请尝试以下方法：'
                                    reject2('未授权')
                                    reject('未授权')
                                }
                            });
                        }).catch(err => {
                            console.log(err)
                        })
                    }

                    if (!haveProblem) {
                        currentTestItem.status = 4
                    }
                    this.testList.splice(index, 1, currentTestItem)
                }).catch(err => {
                    console.log(err)
                })
            },

            // 检测扬声器
            testSpeaker (index) {
                return new Promise(async (resolve, reject) => {
                    const currentTestItem = {...this.testList[index]}
                    currentTestItem.problems = {}
                    currentTestItem.status = 2
                    currentTestItem.index = index
                    let haveProblem = false

                    // 检测浏览器是否支持
                    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                        haveProblem = true
                        currentTestItem.problems['1'] = '浏览器版本过低无法检测扬声器,请下载高版本的谷歌浏览器！'
                        reject('浏览器不支持')
                    }else {
                        if (!await this.checkDevice('audiooutput')) {
                            haveProblem = true
                            currentTestItem.problems['2'] = '系统未检测到扬声器设备，请尝试以下方法：'
                            reject('未发现设备')
                        }else {
                            resolve()
                        }
                    }

                    if (!haveProblem) {
                        currentTestItem.status = 4
                    }
                    this.testList.splice(index, 1, currentTestItem)
                }).catch(err => {
                    console.log(err)
                })
            },

            afterManualTest ({status, index}) {
                this.modelVisible = false
                if (status) {
                    this.$set(this.testList[index], 'status', 1)
                    this.setExplanation()
                }
            },

            // 测试设备是否插入
            checkDevice (type) {
                let num = 0
                let result = false
                return navigator.mediaDevices.enumerateDevices().then(devices => {
                    devices.forEach(device => {
                        if (device.kind === type) num++
                    });
                    if (num > 0) {
                        result = true
                    }
                    return result
                }).catch(function (err) {
                    console.log(err)
                })
            },

            // 生成报告
            checkResult () {
                if (!this.testComplete) {
                    this.$message.warning('请先完成测试')
                    return
                }
                this.resultModelVisible = true
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
            .check-result {
                text-align: center;
                margin-top: 40px;
                button {
                    width: 120px;
                    height: 40px;
                    border-radius: 20px;
                    background-color: @themeColor;
                    color: #fff;
                    font-size: 18px;
                    border: 0;
                    --antd-wave-shadow-color: @themeColor;
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
    .result-model {
        .ant-modal-body {
            padding: 0 0 35px;
            p {
                text-align: center;
                font-size:26px;
                color: @themeColor;
                &.error {
                    color: #FF0000;
                }
            }
            .content {
                padding: 15px 0;
                width: 500px;
                border:2px solid @themeColor;
                border-radius:20px;
                margin: 0 auto;
                .result-item {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    height: 41px;
                    font-size:18px;
                    color: #312C2C;
                    text-align: center;
                    .result-title {
                        width: 80px;
                    }
                    .detail {
                        width: 120px;
                    }
                    .status {
                        font-size: 27px;
                        color: #31d16c;
                        display: flex;
                        align-items: center;
                        .error {
                            color: #FF0000;
                        }
                        span {
                            font-size: 18px;
                            margin-left: 5px;
                        }
                    }
                }
            }
            .btn-box {
                text-align: center;
                margin-top: 60px;
                button {
                    width:160px;
                    height:46px;
                    border-radius:10px;
                    font-size: 18px;
                }
            }

        }
    }
</style>
