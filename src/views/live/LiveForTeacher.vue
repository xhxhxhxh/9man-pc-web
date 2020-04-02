<template>
    <div class="live-container">
        <div class="move-star" ref="moveStar">
            <img src="./images/move_star.png" alt="" class="star">
        </div>
        <div class="animate-star" ref="animateStar" v-show="showAnimateStar">
            <img :src="animateStarSrc" alt="" class="star">
        </div>
        <div class="alert">
            <a-alert
                    v-if="alertVisible"
                    :message="alertMessage"
                    type="success"
            />
        </div>
        <main class="clearFix">
            <div class="main-left" ref="mainLeft">
                <div class="courseware-area" v-show="mode === 'game'">
                    <iframe :src="iframeSrc"
                            ref="iframe" allow="autoplay"></iframe>
                    <iframe :src="iframeSrcCache" style="display: none"
                            allow="autoplay"></iframe>
                </div>
                <div class="video-area" v-show="mode === 'video'" ref="video-area">
                    <video src="" ref="video-play" preload="auto" @timeupdate="videoTimeupdate" @ended="videoEnded"></video>
                </div>
                <div class="draw-area" ref="drawArea">
                    <div id="tui-image-editor" ref="drawArea" :class="{mouseStyle: shape === 'FREE_DRAWING'}"></div>
                </div>
<!--                <div class="wrapper" v-show="shape === 'NORMAL'" ref="wrapper"></div>-->
                <div :class="{'operate-area': true, hidden: stageStatus.length > 0}" @mousemove="e => e.stopPropagation()">
                    <div :class="{default: true, active: shape === 'NORMAL'}" @click="changeDrawStatus('NORMAL')">
                        <icon-font type="iconuf00db"/>
                    </div>
                    <div class="pen" :class="{default: true, active: shape === 'FREE_DRAWING'}" @click="changeDrawStatus('FREE_DRAWING')">
                        <icon-font type="iconpen"/>
                    </div>
                    <div class="delete" :class="{default: true, active: shape === 'DELETE', drawObjectActive: drawObjectActive && shape === 'DELETE'}"
                         @click="changeDrawStatus('DELETE')">
                        <icon-font type="iconsystem-deleteb" />
                    </div>
                    <div class="previous-page" @click="changeAnimate($event, 0)">
                        <a-tooltip placement="right" :visible="firstPageTip">
                            <template slot="title">
                                <span>已经是第一个课件了</span>
                            </template>
                            <a-icon type="step-backward" />
                        </a-tooltip>
                    </div>
                    <div class="next-page" @click="changeAnimate($event, 2)">
                        <a-tooltip placement="right" :visible="lastPageTip">
                            <template slot="title">
                                <span>已经是最后一个课件了</span>
                            </template>
                            <a-icon type="step-backward" />
                        </a-tooltip>
                    </div>
                </div>
                <transition name="play-area-slide">
                    <div class="play-area" v-show="(showPlayArea && mode === 'video' && stageStatus.length <= 0) || showPlayAreaAlways"
                         @mouseenter="showPlayAreaAlways = true" @mouseleave="showPlayAreaAlways = false">
                        <span class="play" @click="videoPlay" ref="play"></span>
                        <a-slider id="test" @change="videoPause" ref="slider"
                                  v-model="progressBar" @afterChange="changeVideoProgress"/>
                    </div>
                </transition>
            </div>
            <div class="main-right">
                <div class="teacher-area">
                    <div class="classroom">
                        <button @click="leaveRoom">离开教室</button>
                        <button @click="startClass" :disabled="startClassDisabled">{{startClassDisabled? '正在': '开始'}}上课</button>
                    </div>
                    <TeacherVideo :rtcRoom="rtcRoom" :teacherName="teacherName" :peerIdList="peerIdList" role="teacher"
                                  :stream="streamObj[teacherId]" :studentList="studentList" @setAlert="setAlert"></TeacherVideo>
                </div>
            </div>
            <div class="main-bottom">
                <div class="students-area">
                    <StudentVideo :id="item.uid" :rtcRoom="rtcRoom" :studentName="item.uname" :stream="streamObj[item.uid]"
                                  v-for="item in studentList" :key="item.uid" :info="item" role="teacher" @setAlert="setAlert"
                                  :roleInfo="roleInfoObj[item.uid]" :roomId="roomId" @addStar="addStar"></StudentVideo>
                </div>
                <div class="placeholder">
                    <img src="./images/placeholder.png" alt="">
                </div>
            </div>
        </main>
    </div>
</template>

<script>
    import { Icon } from 'ant-design-vue';
    import moment from 'moment';
    var ImageEditor = require('tui-image-editor/dist/tui-image-editor.min');
    // var ImageEditor = require('@/lib/tui-image-editor.min');
    import 'tui-image-editor/dist/tui-image-editor.css';
    import exampleImg from './images/example.png';
    import animate_star from './images/animate_star.gif';

    // 导入socket
    import RTCRoom from '@/lib/RTCRoomSDK/RTCRoomManager';

    // 导入直播组件
    import TeacherVideo from '@/components/live/TeacherVideo';
    import StudentVideo from '@/components/live/StudentVideo'

    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_1543360_6pq73ac4jna.js',
    });
    const icona = '/svg/icon-a.svg'
    const iconb = '/svg/icon-b.svg'
    const iconc = '/svg/icon-c.svg'
    const icond = '/svg/icon-d.svg'
    const blackTheme = { // or white
        // main icons
        'menu.normalIcon.path': icond,
        'menu.activeIcon.path': iconb,
        'menu.disabledIcon.path': icona,
        'menu.hoverIcon.path': iconc,
        'submenu.normalIcon.path': icond,
        'submenu.activeIcon.path': iconb
    };

    export default {
        name: "Live",
        data () {
            return {
                // -----------基础数据---------------
                mode: 'game', // 游戏模式:game, 视频模式:video
                showPlayArea: false, // 控制播放器控件显示
                showPlayAreaAlways: false, // 当鼠标进入空间区则一直显示
                firstLoad: true,
                showAnimateStar: false, // 控制星星显示
                animateStarSrc: animate_star,
                startStarAnimate: false, // 星星动画节流
                alertVisible: false, // 顶部提醒框
                alertMessage: '',
                startClassDisabled: false,
                // -----------课件动画数据---------------
                coursewareResource: [],
                gameListIndex: [], // 存放游戏次序的数组
                gameIndex: 0,
                resourceIndex: 0, // 课件播放序号
                iframeSrc: '',
                iframeSrcCache: '',
                //-----------播放器控件数据---------------
                progressBar: 0, // 视频进度条
                //-----------画板数据---------------
                imageEditor: null,
                shape: 'NORMAL', // NORMAL时可操作游戏 FREE_DRAWING画板 DELETE删除
                strokeWidth: 6,  //线宽
                strokeColor: '#ff0000', //线的颜色
                drawObjectActive: false,
                drawParams: {}, // 存放线条数据
                drawTimeout: null, // 开启发送数据计时
                lineIdObj: {}, // 存储本地id与其相对应的移动端id
                // -----------rtcRoom数据---------------
                rtcRoom: null,
                peerIdList: [], // 学生的id
                roleInfoObj: {}, // 学生职位信息
                teacherId: '', // 老师id
                roomId: '',
                studentList: [],
                studentIdList: [], // 存放学生初次连接的id
                studentIdIndexObj: {}, // studentId与其在studentList对应的次序
                teacherName: '',
                className: '',
                streamObj: {}, // 视频流
                // -----------右侧工具栏数据---------------
                firstPageTip: false,
                lastPageTip: false,
            }
        },
        components: {
            IconFont,
            TeacherVideo,
            StudentVideo
        },
        computed: {
            // 监听学生上台状态
            stageStatus () {
                return this.$store.state.liveBroadcast.stageStatusSortByStage
            }
        },
        watch: {
            // 根据上台学生数确认上台布局
            stageStatus: function (stageStatusArr) {
                const stageStatusArrLength = stageStatusArr.length
                const translateLeft = 393 + 120 // 未上台时学生视频的左偏移单位距离

                if (stageStatusArrLength >= 1) { // 退出画板, 暂停视频
                    this.changeDrawStatus('NORMAL')
                    const video = this.$refs['video-play']
                    const play = this.$refs['play']
                    if (!video.paused) {
                        video.pause();
                        play.classList.remove('pause')
                        this.sendMediaData(0, false)
                    }
                }

                if (stageStatusArrLength === 1) {
                    const studentDomObj = document.querySelector('#studentVideo' + stageStatusArr[0])
                    const indexOfStudent = this.studentIdList.indexOf(stageStatusArr[0]) // 获取学生视频的次序，已确定左移距离
                    const translateTop = 783 + 17
                    const scale = 1044 / 320
                    studentDomObj.classList.add('oneStudentOnStage')
                    studentDomObj.classList.remove('moreStudentOnStage')
                    // studentDomObj.style.transform = `translate3d(${(-translateLeft * indexOfstudent + 113) / 100}rem, ${-translateTop / 100}rem, 0) scale(${scale})` // 113为距课件左边界113rem 会出现抖动问题故弃之
                    studentDomObj.style.left = `${(-translateLeft * indexOfStudent + 113) / 100}rem`
                    studentDomObj.style.top = `${-translateTop / 100}rem`
                } else if (stageStatusArrLength > 1) {
                    stageStatusArr.forEach(id => {
                        const studentDomObj = document.querySelector('#studentVideo' + id)
                        studentDomObj.classList.add('moreStudentOnStage')
                    })
                }

                // 双人上台尺寸
                if (stageStatusArrLength === 2) {
                    const top = 783 + 17 - 196
                    const firstLeft = 115
                    const secondLeft = 115 + 520
                    const studentDomObj1 = document.querySelector('#studentVideo' + stageStatusArr[0])
                    const studentDomObj2 = document.querySelector('#studentVideo' + stageStatusArr[1])
                    const indexOfFirstStudent = this.studentIdList.indexOf(stageStatusArr[0])
                    const indexOfSecondStudent = this.studentIdList.indexOf(stageStatusArr[1])
                    studentDomObj1.style.left = `${(-translateLeft * indexOfFirstStudent + firstLeft) / 100}rem`
                    studentDomObj2.style.top = studentDomObj1.style.top = `${-top / 100}rem`
                    studentDomObj2.style.left = `${(-translateLeft * indexOfSecondStudent + secondLeft) / 100}rem`
                }

                // 三人上台尺寸
                if (stageStatusArrLength === 3) {
                    const firstTop = 783 + 17 - 1
                    const secondTop = firstTop - 390
                    const firstLeft = 115 + 520 / 2
                    const secondLeft = 115
                    const thirdLeft = 115 + 520
                    const studentDomObj1 = document.querySelector('#studentVideo' + stageStatusArr[0])
                    const studentDomObj2 = document.querySelector('#studentVideo' + stageStatusArr[1])
                    const studentDomObj3 = document.querySelector('#studentVideo' + stageStatusArr[2])
                    const indexOfFirstStudent = this.studentIdList.indexOf(stageStatusArr[0])
                    const indexOfSecondStudent = this.studentIdList.indexOf(stageStatusArr[1])
                    const indexOfThirdStudent = this.studentIdList.indexOf(stageStatusArr[2])
                    studentDomObj1.style.left = `${(-translateLeft * indexOfFirstStudent + firstLeft) / 100}rem`
                    studentDomObj1.style.top = `${-firstTop / 100}rem`
                    studentDomObj2.style.top = studentDomObj3.style.top = `${-secondTop / 100}rem`
                    studentDomObj2.style.left = `${(-translateLeft * indexOfSecondStudent + secondLeft) / 100}rem`
                    studentDomObj3.style.left = `${(-translateLeft * indexOfThirdStudent + thirdLeft) / 100}rem`
                }

                // 四人上台尺寸
                if (stageStatusArrLength === 4) {
                    const firstTop = 783 + 17 - 1
                    const secondTop = firstTop - 390
                    const firstLeft = 115
                    const secondLeft = 115 + 520
                    const studentDomObj1 = document.querySelector('#studentVideo' + stageStatusArr[0])
                    const studentDomObj2 = document.querySelector('#studentVideo' + stageStatusArr[1])
                    const studentDomObj3 = document.querySelector('#studentVideo' + stageStatusArr[2])
                    const studentDomObj4 = document.querySelector('#studentVideo' + stageStatusArr[3])
                    const indexOfFirstStudent = this.studentIdList.indexOf(stageStatusArr[0])
                    const indexOfSecondStudent = this.studentIdList.indexOf(stageStatusArr[1])
                    const indexOfThirdStudent = this.studentIdList.indexOf(stageStatusArr[2])
                    const indexOfFourthStudent = this.studentIdList.indexOf(stageStatusArr[3])
                    studentDomObj1.style.left = `${(-translateLeft * indexOfFirstStudent + firstLeft) / 100}rem`
                    studentDomObj2.style.left = `${(-translateLeft * indexOfSecondStudent + secondLeft) / 100}rem`
                    studentDomObj3.style.left = `${(-translateLeft * indexOfThirdStudent + firstLeft) / 100}rem`
                    studentDomObj4.style.left = `${(-translateLeft * indexOfFourthStudent + secondLeft) / 100}rem`
                    studentDomObj1.style.top = studentDomObj2.style.top = `${-firstTop / 100}rem`
                    studentDomObj3.style.top = studentDomObj4.style.top = `${-secondTop / 100}rem`
                }
            }
        },
        created() {
            this.init();
        },
        mounted() {
            this.controlPlayArea();
            this.initDrawingBoard();
            // this.sendEventToIframe();
        },
        methods: {
            // 初始化
            async init () {
                // 载入本地存储
                this.$store.commit('readLiveBroadcastDataFromLocalStorage', this.$route.params.roomId)

                // rem适配
                this.resize()

                // 获取课堂信息
                await this.queryClassInfo()

                // 初始化rtcROOM
                this.initRtcRoom()

                // 还原教师页面
                this.recoverPage()

                // 获取课件信息
                this.getCoursewareInfo(this.$route.params.coursewareId)
            },

            // 动态改变rem值
            resize () {
                const baseScreenWidth = 2213;
                const baseFontSize = 100;
                const screenWidth = window.innerWidth;
                const baseDrawingBoardWidth = 1271;
                const baseDrawingBoardHeight = 783;
                document.documentElement.style.fontSize = screenWidth / baseScreenWidth * baseFontSize + 'px';
                this.strokeWidth = parseInt(screenWidth / baseScreenWidth * 6)
                window.onresize =  () => {
                    const screenWidth = window.innerWidth;
                    this.strokeWidth = parseInt(screenWidth / baseScreenWidth * 6)
                    document.documentElement.style.fontSize = screenWidth / baseScreenWidth * baseFontSize + 'px';
                    this.imageEditor.resizeCanvasDimension({
                        width: screenWidth / baseScreenWidth * baseDrawingBoardWidth,
                        height: screenWidth / baseScreenWidth * baseDrawingBoardHeight})
                }
            },

            // 显示与隐藏播放器
            controlPlayArea () {
                const mainLeft = this.$refs.mainLeft;
                let timeout = null;
                let timeout2 = null;

                mainLeft.onmouseenter = () => {
                    this.showPlayArea = true;
                    if (timeout2) {
                        clearInterval(timeout2);
                        timeout2 = null;
                    }
                }

                mainLeft.onmousemove = () => {
                    this.showPlayArea = true;
                    if (timeout) {
                        clearInterval(timeout)
                        timeout = null;
                    }
                    timeout = setInterval(() => {
                        this.showPlayArea = false;
                        clearInterval(timeout);
                        timeout = null;
                    }, 2000)
                }

                mainLeft.onmouseleave = () => {
                    if (!timeout2) {
                        timeout2 = setInterval(() => {
                            this.showPlayArea = false;
                            clearInterval(timeout2);
                            timeout2 = null;
                        }, 1000)
                    }
                }
            },

            // 初始化rtcROOM
            initRtcRoom() {
                const rtcRoom = RTCRoom.getInstance()
                const host = 'www.9mankid.com'
                const port = 3210
                const roomId = this.$route.params.roomId
                const teacherPeerId = this.$route.params.teacherId
                const userParams = {name: this.$route.params.name, headUrl: '', role: 1}
                rtcRoom.joinRoom(host,port,roomId,teacherPeerId,userParams)
                this.teacherId = teacherPeerId
                this.roomId = roomId
                this.$store.commit('setTeacherId', teacherPeerId)
                this.$store.commit('setRoomId', roomId)
                this.className = userParams.classname
                // 设置iframeSrc
                // this.iframeSrc = `https://www2.9man.com/syncshuxe/start.html?path=3-1&roomId=${roomId}&peerId=${teacherPeerId}&manager=1`

                // this.peerIdList = ['a', 'b', 'c', 'd']

                // 用户加入时更新peerIdList
                rtcRoom.on('user-joined',(id) => {
                    console.log('用户进入：' + id)
                    this.$set(this.streamObj, id, null)
                    if (id === teacherPeerId) {
                        rtcRoom.getAllRoomUser().forEach(item => {
                            const peerId = item._peerId
                            if (peerId !== teacherPeerId) {
                                this.peerIdList.push(peerId)
                            }
                        })
                        rtcRoom.requestRoomInfo('user_sort', {});
                        rtcRoom.requestRoomInfo('room_config', {manager: teacherPeerId});
                        rtcRoom.requestRoomInfo('ai_role_info', {});
                    }
                    if (!this.peerIdList.includes(id) && id !== teacherPeerId) {
                        this.peerIdList.push(id)
                    }
                    this.$store.commit('setPeerIdList', this.peerIdList)
                })


                //用户连接成功成功时设置用户状态
                rtcRoom.on('user-peer-connected',(id) => {
                    console.log('用户连接：' + id)
                    if (id === teacherPeerId) return
                    rtcRoom.requestRoomInfo('user_sort', {});

                    this.$set(this.studentList[this.studentIdIndexObj[id]], 'joinRoom', true)
                    this.$set(this.studentList[this.studentIdIndexObj[id]], 'isconnect', true)

                    const liveBroadcastData = this.$store.state.liveBroadcast.liveBroadcastData
                    // 处理静音状态
                    const userAudioStatus = liveBroadcastData.audioStatus[id]
                    if (userAudioStatus) {
                        if (userAudioStatus === 1) {
                            rtcRoom.openAudio(id);
                        } else if (userAudioStatus === 2) {
                            rtcRoom.closeAudio(id)
                        }
                    } else {
                        rtcRoom.openAudio(id)
                        this.$store.commit('setAudioStatus', {id: id, status: 1})
                    }

                    // const allOperation = liveBroadcastData.allOperation
                    // if (allOperation) { // 全部授权同步授权状态
                    //     this.$store.commit('setControlStatus', {id: id, status: 1})
                    // }

                    this.synchronize(id)
                });

                // 用户离开时更新peerIdList
                rtcRoom.on('user-leaved',(id) => {
                    console.log('用户离开：' + id, this.peerIdList.indexOf(id))
                    const index = this.peerIdList.indexOf(id)
                    if (id !== teacherPeerId) {
                        this.$set(this.studentList[this.studentIdIndexObj[id]], 'isconnect', false)
                    }
                    if (index !== -1) {
                        // 关闭学生操作
                        const {liveBroadcastData} = this.$store.state.liveBroadcast
                        const {allOperation} = liveBroadcastData
                        const controlOpenStatus = this.$store.getters.updateControlStatus // 处于开启操作的用户数组
                        const currentOperateUser = controlOpenStatus[0]
                        if (!allOperation && currentOperateUser === id) {
                            const params = {
                                event: 'single_operations',
                                data: {
                                    sync: {
                                        page: this.resourceIndex,
                                        type: 0
                                    },
                                    peerId: ''
                                }
                            }
                            this.setAlert({visiable: false, message: ''})
                            this.rtcRoom.sendMessage(params)
                            this.rtcRoom.changeAIControl(teacherPeerId)
                        }

                        this.peerIdList.splice(index, 1)
                        this.$store.commit('setPeerIdList', this.peerIdList)
                        this.$store.commit('resetStatus', id)
                        // 下台
                        const studentVideo = document.querySelector('#studentVideo' + id)
                        studentVideo.style = ''
                    }
                });

                rtcRoom.on('media-receive', (peerId, stream) => {
                    this.$set(this.streamObj, peerId, stream)
                })

                // 获取学生职位
                rtcRoom.on('ai-action-notify', (method,data) => {
                    if(data.available) {
                        this.$set(this.roleInfoObj, data.peerId, {src: data.midpath + data.path})
                    }
                })

                // 获取学生次序
                rtcRoom.on('room-info-notify',(method,data) => {
                    if (method === 'user_sort') {
                        const list = data.list
                        if (JSON.stringify(this.studentIdList) === JSON.stringify(list)) return

                        // 处理学生顺序
                        const studentIdObj = {}
                        const studentIdOldIndexObj = {} // 旧次序
                        const cacheStudentList = []
                        this.studentList.forEach((item, index) => {
                            studentIdOldIndexObj[item.uid] = index
                        })

                        for(let index = 0; index < list.length; index++) {
                            let currentStudentId = list[index]
                            studentIdObj[currentStudentId] = index
                            if(studentIdOldIndexObj[currentStudentId] !== undefined) {
                                cacheStudentList[index] = this.studentList[studentIdOldIndexObj[currentStudentId]]
                                delete studentIdOldIndexObj[currentStudentId]
                            }else {
                                list.splice(index, 1)
                                index--
                            }
                        }

                        let len = list.length
                        if(len < this.studentList.length) {
                            for(let key in studentIdOldIndexObj) {
                                cacheStudentList[len] = this.studentList[studentIdOldIndexObj[key]]
                                studentIdObj[key] = len
                                list.push(key)
                                len++
                            }
                        }

                        this.studentIdList = list
                        this.$store.commit('setStudentIdList', list)
                        this.studentList = cacheStudentList
                        this.studentIdIndexObj = studentIdObj
                    } else if (method === 'ai_role_info') {
                        const roleInfoList = data.list
                        const roleInfoObj = {}
                        roleInfoList.forEach(item => {
                            const src = item.midpath + item.path
                            roleInfoObj[item.peerId] = {src}
                        })
                        this.roleInfoObj = roleInfoObj
                    }

                });

                // 用户关闭页面
                window.onbeforeunload = () => {
                    // this.allUsersCancelOperate();
                    if (this.mode === 'video') {
                        this.$store.commit('setVideoProgress', {index: this.resourceIndex, progress: this.progressBar}) // 存储视频进度
                    }
                    rtcRoom.leaveRoom();
                }

                this.rtcRoom = rtcRoom
                this.$store.commit('setRtcRoom', rtcRoom)
            },

            // 还原老师掉线前状态
            recoverPage () {
                const liveBroadcastData = this.$store.state.liveBroadcast.liveBroadcastData
                // const mode = liveBroadcastData.mode
                // if (!mode) { // 无本地缓存时
                //     this.firstLoad = false
                // }else {
                //     this.mode = mode
                // }
                this.resourceIndex = liveBroadcastData.coursewarePage? liveBroadcastData.coursewarePage: 0
            },

            // 离开房间
            leaveRoom () {
                this.$confirm({
                    title: '确定要退出房间吗?',
                    content: '',
                    centered: true,
                    onOk:() => {
                        localStorage.removeItem('9manLiveBroadcast');
                        window.close();
                    },
                    onCancel() {},
                });
            },

            // 老师离开房间 取消全部授权和全部上台(移交给学生端处理)
            allUsersCancelOperate () {
                const allOperation = this.$store.state.liveBroadcast.liveBroadcastData.allOperation
                if (allOperation) {
                    this.$store.commit('setAllOperationStatus',false)
                }else { // 取消单个学生授权
                    const controlOpenStatus = this.$store.getters.updateControlStatus // 处于开启操作的用户数组
                    if (controlOpenStatus.length > 0) {
                        const params = {
                            event: 'single_operations',
                            data: {
                                sync: {
                                    page: this.resourceIndex,
                                    type: 0
                                },
                                peerId: ''
                            }
                        }
                        this.setAlert({visiable: false, message: ''})
                        this.rtcRoom.sendMessage(params)
                        this.rtcRoom.changeAIControl(this.teacherId)
                    }
                }
                this.$store.commit('updateStageStatusAll',false)
            },

            // 当学生连接时同步状态
            synchronize(userId) {
                const {liveBroadcastData} = this.$store.state.liveBroadcast
                const {allOperation} = liveBroadcastData
                const updateControlStatus = this.$store.getters.updateControlStatus
                const params = {
                    event: 'live_sync',
                    data: {
                        from: 'web',
                        shape: 'curve',
                        hbColor: '#ff0000',
                        hbLine: 3,
                        isSingleOperate: !!updateControlStatus.length,
                        operateId: updateControlStatus.length? updateControlStatus[0]: '',
                        isAllOperate: allOperation,
                        isAllVideo: false,
                        isSingleVideo: this.stageStatus.length > 0,
                        singleVideoArr: this.stageStatus,
                        sync: {
                            page: this.resourceIndex,
                            type: 0
                        },
                    }
                }

                // 视频模式下
                if(this.mode === 'video') {
                    const video = this.$refs['video-play']
                    Object.assign(params.data.sync, {
                        value: this.progressBar / 100,
                        isplay: !video.paused,
                    })
                }

                this.rtcRoom.notifyMessage(params, userId)
            },

            // 获取课件信息
            getCoursewareInfo (id) {
                const params = {
                    courseware_no: id
                }
                this.$axios.get(this.$store.state.apiUrl + '/v1/courseware/queryCoursewareDetail', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.coursewareResource = data.data.data.courseware_resource
                            const gameListIndex = []
                            this.coursewareResource.forEach((item, index) => {
                                if (item.type === 2) {
                                    gameListIndex.push(index)
                                }
                            })
                            this.gameListIndex = gameListIndex
                            this.changeAnimate(this.$event, 1, this.firstLoad) // 载入课件
                        } else {

                        }
                    })
                    .catch(() => {

                    })
            },

            // 查询课堂信息
            queryClassInfo () {
                const params = {
                    id: this.$route.params.classId
                }
                return this.$axios.get(this.$store.state.apiUrl + '/v1/classRoom/queryClassRoomInfo', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            const studentList = data.data.data.student_list
                            const historyList = data.data.data.history_list
                            const historyObj = {}
                            const localStudentIdList = this.$store.state.liveBroadcast.liveBroadcastData.studentIdList

                            historyList.forEach(item => {
                                historyObj[item.uid] = item
                            })

                            studentList.forEach((item, index) => {
                                this.studentIdIndexObj[item.uid] = index
                                item.star = historyObj[item.uid].star // 将historyList中的star放入studentList中
                                if (localStudentIdList.includes(item.uid)) {
                                    item.joinRoom = true
                                }else {
                                    item.joinRoom = false
                                }
                                item.isconnect = false
                            })
                            this.studentList = studentList
                            this.teacherName = data.data.data.teacher_name
                        }
                    })
                    .catch(() => {

                    })
            },

            // 开始上课
            startClass () {
                const params = {
                    room_no: this.roomId
                }
                this.$axios.post(this.$store.state.apiUrl + '/v1/classRoom/updateClassRoomStart', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.startClassDisabled = true
                        } else {
                            this.$message.warning(data.msg, 3)
                        }
                    })
                    .catch(() => {

                    })
            },

            // 初始化画板
            initDrawingBoard () {
                const mainLeft = this.$refs.mainLeft;
                const drawingBoardWidth = mainLeft.offsetWidth;
                const drawingBoardHeight = mainLeft.offsetHeight;
                const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
                    includeUI: {
                        loadImage: {
                            path: exampleImg,
                            name: 'SampleImage'
                        },
                        theme: blackTheme,
                        initMenu: 'filter',
                        menuBarPosition: 'bottom'
                    },
                    cssMaxWidth: drawingBoardWidth,
                    cssMaxHeight: drawingBoardHeight,
                    selectionStyle: {
                        cornerSize: 0,
                        rotatingPointOffset: 0,
                        borderColor: '#000',
                    }
                });
                // console.log(instance)
                // var path = new instance._graphics._fabric.Path('M121.32,0L44.58,0C36.67,0,29.5,3.22,24.31,8.41c-5.19,5.19-8.41,12.37-8.41,20.28c0,15.82,12.87,28.69,28.69,28.69c0,0,4.4,0,7.48,0C36.66,72.78,8.4,101.04,8.4,101.04C2.98,106.45,0,113.66,0,121.32c0,7.66,2.98,14.87,8.4,20.29l0,0c5.42,5.42,12.62,8.4,20.28,8.4c7.66,0,14.87-2.98,20.29-8.4c0,0,28.26-28.25,43.66-43.66c0,3.08,0,7.48,0,7.48c0,15.82,12.87,28.69,28.69,28.69c7.66,0,14.87-2.99,20.29-8.4c5.42-5.42,8.4-12.62,8.4-20.28l0-76.74c0-7.66-2.98-14.87-8.4-20.29C136.19,2.98,128.98,0,121.32,0z',{
                //     fill: null,
                //     strokeLineCap: 'round',
                //     strokeLineJoin: 'round',
                //     strokeDashArray: null,
                //     strokeWidth: 3,
                //     originX: 'center',
                //     originY: 'center',
                //     borderColor: "#000",
                //     cornerColor: "green",
                //     cornerSize: 0,
                //     lockMovementX: true,
                //     lockMovementY: true,
                //     lockRotation: true,
                //     lockScalingX: true,
                //     lockScalingY: true,
                //     stroke: "rgba(255,0,0,1)",
                //     transparentCorners: false
                // });
                // path.set({ left: 120, top: 120 });
                // instance._graphics._canvas.add(path);
                // instance._graphics._canvas.fire('path:created', { path: path });

                this.imageEditor = instance;
                const _this = this;
                const canvas = document.querySelector('#tui-image-editor');
                const upperCanvas = document.querySelector('.upper-canvas');

                instance.on('objectActivated', function(props) {
                    const id = props.id
                    let lineIdList = []
                    const lineIdObj = _this.lineIdObj[id]
                    if (lineIdObj) { // 存在表示单选，不存在表示选择了多条直线
                        lineIdList.push(lineIdObj)
                    } else {
                        const lineIdArr = instance._graphics._canvas._activeGroup._objects // 选择线条对象
                        lineIdArr.forEach(item => {
                            lineIdList.push(_this.lineIdObj[item['__fe_id']])
                        })
                    }
                    const params = {
                        event: 'delete_line_choose_add',
                        data: {
                            lineIds: lineIdList,
                            source: 'web',
                            sync:{
                                page: _this.resourceIndex,
                                type: 0
                            }
                        }
                    }
                    _this.rtcRoom.sendMessage(params)
                });

                //鼠标点击事件
                canvas.onmousedown = function(event) {
                    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                    const mainRect = mainLeft.getBoundingClientRect()
                    const mainLeft2 = mainRect.left
                    const mainTop = mainRect.top

                    let startPoint = [event.clientX + scrollLeft - mainLeft2, event.clientY + scrollTop - mainTop]

                    if (_this.shape === 'FREE_DRAWING') {
                        // 计算lineId
                        const activeGroup = instance._graphics._canvas._activeGroup
                        const objects = instance._graphics._objects
                        const objectsIdArr = Object.keys(objects)
                        const num = (Array(7).join('0') + objectsIdArr.length).slice(-7)
                        var lineId = moment().format('HHmmssSSS') + num

                        if (activeGroup) { // 清除多选状态
                            instance._graphics._canvas.deactivateAll();
                            instance._graphics._canvas.renderAll();
                        }

                        _this.drawParams = {
                            event: 'add_line',
                            data: {
                                sync:{
                                    page: _this.resourceIndex,
                                    type: 0
                                },
                                lineId,
                                shape: 'curve',
                                hbsize: [canvas.offsetWidth, canvas.offsetHeight],
                                line: _this.strokeWidth,
                                color: _this.strokeColor,
                                pointlist: [startPoint],
                            }
                        }
                        _this.drawByShape();
                        _this.sendDrawData();

                        //鼠标移动事件
                        document.onmousemove = function (event) {
                            _this.drawParams.data.pointlist.push([event.clientX + scrollLeft - mainLeft2, event.clientY + scrollTop - mainTop])
                            _this.sendDrawData()
                        };
                    }

                    if (_this.shape === 'DELETE') {
                        const params = {
                            event: 'select_line',
                            data: {
                                action: 'mousedown',
                                hbsize: [canvas.offsetWidth, canvas.offsetHeight],
                                startPoint: [event.clientX + scrollLeft, event.clientY + scrollTop],
                                sync:{
                                    page: _this.resourceIndex,
                                    type: 0
                                }
                            }
                        }
                        _this.rtcRoom.sendMessage(params)

                        if (!instance._graphics._canvas.findTarget(event)) { // 取消选中
                            const params = {
                                event: 'delete_line_choose_cancel',
                                data: {
                                    source: 'web',
                                    sync:{
                                        page: _this.resourceIndex,
                                        type: 0
                                    }
                                }
                            }
                            _this.rtcRoom.sendMessage(params)
                        }

                        //鼠标移动事件
                        document.onmousemove = function (event) {
                            const params = {
                                event: 'select_line',
                                data: {
                                    action: 'mousemove',
                                    hbsize: [canvas.offsetWidth, canvas.offsetHeight],
                                    startPoint: [event.clientX + scrollLeft, event.clientY + scrollTop],
                                    sync:{
                                        page: _this.resourceIndex,
                                        type: 0
                                    }
                                }
                            }
                            _this.rtcRoom.sendMessage(params)
                        };
                    }

                    //鼠标抬起事件
                    document.onmouseup = function (event) {
                        if (_this.shape === 'FREE_DRAWING') {
                            // 禁止图像旋转移动
                            const objects = instance._graphics._objects
                            const objectsIdArr = Object.keys(objects)
                            const lineIdLocal = parseInt(objectsIdArr[objectsIdArr.length - 1])
                            instance.setObjectProperties(lineIdLocal, {
                                lockMovementX: true,
                                lockMovementY: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                lockRotation: true
                            });

                            _this.lineIdObj[lineIdLocal] = lineId // 存储本地id与其相对应的移动端id

                            _this.drawParams.data.pointlist.push([event.clientX + scrollLeft - mainLeft2, event.clientY + scrollTop - mainTop])
                            _this.drawParams.data.finished = 1
                            _this.sendDrawData()
                            instance.stopDrawingMode(); //即时更换线条颜色
                            _this.drawByShape();
                            document.onmousemove = null;
                        }

                        if (_this.shape === 'DELETE') {
                            // 判断是否有选择对象
                            const objectId = instance.activeObjectId;
                            if (!objectId && _this.drawObjectActive) {
                                _this.drawObjectActive = false;
                            } else if (objectId &&  !_this.drawObjectActive) {
                                _this.drawObjectActive = true;
                            }
                            const params = {
                                event: 'select_line',
                                data: {
                                    action: 'mouseup',
                                    hbsize: [canvas.offsetWidth, canvas.offsetHeight],
                                    startPoint: [event.clientX + scrollLeft, event.clientY + scrollTop],
                                    sync:{
                                        page: _this.resourceIndex,
                                        type: 0
                                    }
                                }
                            }
                            _this.rtcRoom.sendMessage(params)
                            document.onmousemove = null;
                        }
                        document.onmouseup = null;
                    }
                };
            },

            // 当处于课件操作状态时，将wrapper中的事件传发到iframe (改用点击穿透)
            sendEventToIframe () {
                const wrapper = this.$refs.wrapper;
                const iframe = this.$refs.iframe;
                const _this = this;

                //鼠标点击事件
                wrapper.onmousedown = function(event) {
                    if (_this.mode !== 'game') return;
                    let gameCanvas = iframe.contentWindow.document.querySelector('#gameCanvas');
                    const e = {
                        screenX: event.screenX,
                        screenY: event.screenY,
                        clientX: event.layerX,
                        clientY: event.layerY,
                    }

                    const mouseEvent = document.createEvent("MouseEvents");
                    mouseEvent.initMouseEvent("mousedown", true, true, document.defaultView, 0, e.screenX, e.screenY,
                        e.clientX , e.clientY, false, false, false, false, 0, null);
                    gameCanvas.dispatchEvent(mouseEvent);

                    //鼠标移动事件
                    document.onmousemove = function (event) {
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.layerX,
                            clientY: event.layerY,
                        }
                        mouseEvent.initMouseEvent("mousemove", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            e.clientX , e.clientY, false, false, false, false, 0, null);
                        gameCanvas.dispatchEvent(mouseEvent);
                    };

                    //鼠标抬起事件
                    document.onmouseup = function (event) {
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.layerX,
                            clientY: event.layerY,
                        }
                        mouseEvent.initMouseEvent("mouseup", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            e.clientX , e.clientY, false, false, false, false, 0, null);
                        gameCanvas.dispatchEvent(mouseEvent);
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                };
            },

            //根据shape绘制图形
            drawByShape () {
                const shape = this.shape;
                if (shape === 'FREE_DRAWING') {
                    this.drawCurve()
                }
            },

            //画曲线
            drawCurve () {
                const imageEditor = this.imageEditor;
                imageEditor.startDrawingMode('FREE_DRAWING', {
                    width: this.strokeWidth,
                    color: this.strokeColor
                });
            },

            //停止绘画
            stopDrawing () {
                const imageEditor = this.imageEditor;
                imageEditor.stopDrawingMode();
                imageEditor.changeCursor('default');
            },

            //橡皮擦功能
            eraser () {
                const imageEditor = this.imageEditor;
                const objectId = imageEditor.activeObjectId;
                if (this.shape !== 'NORMAL') {
                    this.stopDrawing();
                }
                imageEditor.removeActiveObject();
                this.drawObjectActive = false

                // 发送删除图形请求
                const params = {
                    event: 'delete_line',
                    data: {
                        source: 'web',
                        sync:{
                            page: this.resourceIndex,
                        }
                    }
                }
                this.rtcRoom.sendMessage(params)
            },

            //清除所有
            clearAll () {
                const imageEditor = this.imageEditor;
                imageEditor.clearObjects();
                this.drawObjectActive = false;
                imageEditor._graphics._canvas.deactivateAll();
                imageEditor._graphics._canvas.renderAll();
            },

            //发送画图数据
            sendDrawData () {
                if (!this.drawTimeout) {
                    this.drawTimeout = setInterval(() => {
                        this.rtcRoom.sendMessage(this.drawParams)
                        clearInterval(this.drawTimeout)
                        this.drawTimeout = null
                    }, 100)
                }
            },

            // 显示隐藏画板
            changeDrawStatus(status) {
                this.shape = status;
                const drawArea = this.$refs.drawArea
                if (status === 'FREE_DRAWING') {
                    drawArea.style.pointerEvents = 'auto'
                    this.drawByShape();
                } else if (status === 'NORMAL') {
                    drawArea.style.pointerEvents = 'none'
                    this.stopDrawing();
                } else if (status === 'DELETE') {
                    drawArea.style.pointerEvents = 'auto'
                    this.eraser();
                }
            },

            // 视频播放功能
            videoPlay () {
                if (this.mode !== 'video') return
                const video = this.$refs['video-play']
                const play = this.$refs['play']
                if (video.paused) {
                    video.play();
                    play.classList.add('pause')
                    this.sendMediaData(0, true)
                }else {
                    video.pause();
                    play.classList.remove('pause')
                    this.sendMediaData(0, false)
                }
            },

            // 显示视频播放进度
            videoTimeupdate (e) {
                const video = e.target
                const currentTime = video.currentTime
                //计算进度条百分比
                if (!video.paused) {
                    this.progressBar = parseInt(currentTime / video.duration * 100)
                }
            },

            // 改变视频播放进度
            changeVideoProgress (value) {
                const slider = this.$refs['slider']
                const video = this.$refs['video-play']
                const play = this.$refs['play']
                slider.blur() // antd slider bug
                this.sendMediaData(0, !video.paused, value / 100)
                if (play.classList.contains('pause')) {
                    video.play()
                    this.sendMediaData(0, true)
                }
                video.currentTime = value / 100 * video.duration
            },

            // 拖拽进度条时，暂停视频
            videoPause () {
                const video = this.$refs['video-play']
                if (!video.paused) {
                    video.pause()
                }
            },

            // 视频播放结束
            videoEnded (e) {
                const video = e.target
                const play = this.$refs['play']
                video.currentTime = 0
                this.progressBar = 0
                play.classList.remove('pause')
            },

            // 发送多媒体操作数据
            sendMediaData (type, isplay, progress) {
                let params = {}
                if (progress || progress === 0) {
                    params = {
                        event: 'player_seek_to_value',
                        data: {
                            value: progress,
                            sync: {
                                type: 0,
                                value: progress,
                                page: this.resourceIndex
                            }
                        }
                    }
                }else {
                    params = {
                        event: 'media_controll',
                        data: {
                            isplay,
                            source: 'fromweb',
                            sync: {
                                type: 0,
                                value: this.progressBar / 100,
                                page: this.resourceIndex
                            }
                        }
                    }
                }
                this.rtcRoom.sendMessage(params)
            },

            // 设置提醒框
            setAlert (data) {
                this.alertVisible = data.visiable
                this.alertMessage = data.message
            },

            // 切换动画
            changeAnimate (e, direction, firstLoad) {
                if (this.$store.state.liveBroadcast.liveBroadcastData.allOperation) {
                    return this.$message.warning('请先关闭全部授权', 5);
                }
                if (this.$store.getters.updateControlStatus) {
                    return this.$message.warning('请先关闭单人授权', 5);
                }
                this.changeDrawStatus('NORMAL');
                const length = this.coursewareResource.length - 1
                let index = this.resourceIndex
                if(!firstLoad) {
                    this.$store.commit('setVideoProgress', {index, progress: this.progressBar, noSave: true}) // 存储视频进度
                }
                if (direction === 2) { // 动画前进
                    if (index >= length && !firstLoad) {
                        this.lastPageTip = true
                        setTimeout(() => {
                            this.lastPageTip = false
                        }, 2000)
                        return
                    }
                    this.clearAll()
                    this.resourceIndex ++
                }else if (direction === 0) { // 动画后退
                    if (index <= 0 && !firstLoad) {
                        this.firstPageTip = true
                        setTimeout(() => {
                            this.firstPageTip = false
                        }, 2000)
                        return
                    }
                    this.clearAll()
                    this.resourceIndex --
                }
                const courseware = this.coursewareResource[this.resourceIndex]
                const type = courseware.type
                const url = courseware.url
                const resourceUrl = this.$store.state.resourceUrl
                this.gameCache()
                const video = this.$refs['video-play']
                video.pause()
                if (type === 1) { // 视频
                    this.$store.commit('setOperatePermission', false)
                    this.mode = 'video'
                    video.src = resourceUrl + '/' + url
                    const play = this.$refs['play']
                    play.classList.remove('pause')
                    let videoProgress = this.$store.state.liveBroadcast.liveBroadcastData.videoProgress[this.resourceIndex]
                    this.progressBar = videoProgress? videoProgress: 0
                    video.oncanplay = () => {
                        video.oncanplay = null
                        video.currentTime = this.progressBar / 100 * video.duration
                    }
                }else if (type === 2) { // 动画
                    this.$store.commit('setOperatePermission', true)
                    this.mode = 'game'
                    this.iframeSrc = resourceUrl + '/' + url + `&roomId=${this.roomId}&peerId=` + this.teacherId + '&manager=1'
                }
                this.sendMediaData(this.mode === 'video'? 1: 0, false)
                const params = {
                    event: 'show_content_change',
                    data: {
                        page: this.resourceIndex,
                        type: 0,
                        sync: {
                            page: this.resourceIndex,
                            value: this.progressBar / 100,
                        },
                    },
                }
                this.$store.commit('setCoursewarePage', this.resourceIndex)
                if (!firstLoad) {
                    this.rtcRoom.sendMessage(params)
                }
            },

            // 缓存游戏
            gameCache () {
                const resourceUrl = this.$store.state.resourceUrl
                const resourceIndex = this.resourceIndex
                const gameListIndex = this.gameListIndex
                const gameIndex = this.gameIndex = this.searchInsert(gameListIndex, resourceIndex)

                let realCurrentIndex = gameListIndex[gameIndex]
                let realNextIndex = gameListIndex[gameIndex + 1]
                if (realCurrentIndex === resourceIndex) {
                    if (realNextIndex) {
                        this.iframeSrcCache = resourceUrl + '/' + this.coursewareResource[realNextIndex].url.replace('start', 'load') +
                            `&roomId=${this.roomId}&peerId=` + this.teacherId + '&manager=1'
                    }
                }else {
                    this.iframeSrcCache = resourceUrl + '/' + this.coursewareResource[realCurrentIndex].url.replace('start', 'load') +
                        `&roomId=${this.roomId}&peerId=` + this.teacherId + '&manager=1'
                }
            },

            // 查找当前课件所在游戏列表的位置
            searchInsert(nums, target) {
                let right = nums.length - 1;
                let left = 0;

                if (target > nums[right]) {
                    return 0;
                }

                if (target <= nums[left]) {
                    return 0;
                }

                while (left <= right) {
                    let middle = Math.floor((left + right) / 2);
                    if (middle === left) return left + 1;
                    if (target > nums[middle]) {
                        left = middle;
                    } else if (target < nums[middle]) {
                        right = middle;
                    } else {
                        return middle;
                    }
                }

            },

            // 增加星星数
            addStar(data) {
                const id = data.id
                const star = data.star + 1
                this.$set(this.studentList[this.studentIdIndexObj[id]], 'star', star)
            },
        }
    }
</script>

<style lang="less">
    @import "../../less/index";

    .live-container {
        background:rgba(248,209,194,1);
        padding: 20rem/@baseFontSize 140rem/@baseFontSize;
        position: relative;
        min-height: 100%;
        .move-star {
            position: absolute;
            left: 1650rem/@baseFontSize;
            bottom: 0;
            height: 253rem/@baseFontSize;
            width: 267rem/@baseFontSize;
            transform: translate(0, 0) scale(0);
            z-index: 9999;
            &.move {
                left: 50%;
                bottom: 60.4%;
                transform: translate(-50%, 50%) scale(1);
                transition: all .5s ease;
            }
            img {
                display: block;
                height: 100%;
            }
        }
        .animate-star {
            position: absolute;
            left: 50%;
            bottom: 60%;
            transform: translate(-50%, 50%);
            height: 480rem/@baseFontSize;
            width: 800rem/@baseFontSize;
            z-index: 9999;
            img {
                display: block;
                height: 100%;
            }
        }
        .alert {
            position: fixed;
            z-index: 999;
            top: 20rem/@baseFontSize;
            left: 50%;
            transform: translate(-50%, 0);
            opacity: 0.9;
            .ant-alert {
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        }
        main {
            position: relative;
            .main-left {
                float: left;
                width:1271rem/@baseFontSize;
                height:783rem/@baseFontSize;
                border-radius:10rem/@baseFontSize;
                position: relative;
                overflow: hidden;
                .courseware-area {
                    width: 100%;
                    height: 100%;
                    border-radius:10rem/@baseFontSize;
                    position: absolute;
                    left: 0;
                    right: 0;
                    iframe {
                        width: 100%;
                        height: 100%;
                    }
                }
                .video-area {
                    width: 100%;
                    height: 100%;
                    border-radius:10rem/@baseFontSize;
                    position: absolute;
                    left: 0;
                    right: 0;
                    video {
                        width: 100%;
                        height: 100%;
                    }
                }
                .draw-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    width: 100%;
                    pointer-events: none;
                    #tui-image-editor {
                        width: 100% !important;
                        height: 100% !important;
                        border-radius:10rem/@baseFontSize;
                        overflow: hidden;
                        background-color: rgba(0, 0, 0, 0);
                        &.mouseStyle .upper-canvas {
                            cursor: url("./images/pen.cur"), crosshair !important;
                        }
                        .tui-image-editor-main-container {
                            width: 100%;
                            height: 100%;
                            background-color: unset !important;
                            .tui-image-editor-header {
                                display: none;
                            }
                            .tui-image-editor-main {
                                top: 0;
                                .tui-image-editor-submenu {
                                    display: none;
                                }
                                .tui-image-editor-wrap {
                                    overflow: unset;
                                    top: 0;
                                    .tui-image-editor {
                                        top: 0 !important;
                                    }
                                }

                            }
                        }
                        .tui-image-editor-controls {
                            display: none;
                        }
                    }
                }
                .operate-area {
                    position: absolute;
                    width:60rem/@baseFontSize;
                    height:400rem/@baseFontSize;
                    background:rgba(255,255,255,1);
                    box-shadow:0 0 5rem/@baseFontSize 0 rgba(248,87,21,0.34);
                    border-radius:10rem/@baseFontSize;
                    right: 6rem/@baseFontSize;
                    top: 50%;
                    transform: translate(0, -50%);
                    transition: all .3s ease;
                    padding: 0 6rem/@baseFontSize;
                    display: flex;
                    justify-content: space-evenly;
                    flex-direction: column;
                    z-index: 999;
                    &.hidden {
                        transform: translate(150%, -50%);
                    }
                    > div {
                        width: 48rem/@baseFontSize;
                        height: 48rem/@baseFontSize;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                        border-radius: 50%;
                        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                        position: relative;
                        &:nth-of-type(1), &:nth-of-type(2), &:nth-of-type(3) {
                            &:hover, &.active {
                                background-color: #F85715;
                                i {
                                    color: #fff;
                                }
                            }
                            &.drawObjectActive {
                                background-color: unset;
                                i {
                                    color: #F85715;
                                }
                            }
                        }
                        &:nth-of-type(n + 4) {
                            &:hover i{
                                color: #F85715;
                            }
                        }
                        &:nth-of-type(4) {
                            transform: rotate(90deg);
                        }
                        &:nth-of-type(5) {
                            transform: rotate(-90deg);
                        }
                        i {
                            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                            color: #F8D1C2;
                            font-size: 28rem/@baseFontSize;
                        }
                    }
                }
                .wrapper {
                    width: 100%;
                    height: 100%;
                    border-radius:10rem/@baseFontSize;
                    position: absolute;
                    left: 0;
                    right: 0;
                    z-index: 99;
                }
                .play-area {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    z-index: 999;
                    width: 100%;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    height: 66rem/@baseFontSize;
                    background:rgba(0,0,0,0.6);
                    .ant-slider {
                        width: 1035rem/@baseFontSize;
                        height: 20rem/@baseFontSize;
                        margin: 0;
                        padding: 0;
                        &:hover .ant-slider-rail {
                            background-color: #fff;
                        }
                        .ant-slider-rail {
                            height: 20rem/@baseFontSize;
                            border-radius: 20rem/@baseFontSize;
                            background-color: #fff;
                        }
                        .ant-slider-track {
                            height: 20rem/@baseFontSize;
                            border-radius: 10rem/@baseFontSize 0 0 10rem/@baseFontSize;
                            background-color: #FF6A04;
                        }
                        .ant-slider-handle {
                            height: 36rem/@baseFontSize;
                            width: 36rem/@baseFontSize;
                            border: 4rem/@baseFontSize solid #FF6A04;
                            box-shadow: unset;
                            margin-top: -8rem/@baseFontSize;
                        }
                    }
                    > span {
                        height: 50rem/@baseFontSize;
                        width: 50rem/@baseFontSize;
                        display: inline-block;
                        cursor: pointer;
                        background-size: cover;
                    }
                    .play {
                        background-image: url("images/play.png");
                        background-position: center;
                        &.pause {
                            background-image: url("images/pause.png");
                            background-position: -1rem/@baseFontSize 0;
                        }
                        &.disable {
                            background-image: url("images/play_disable.png");

                        }
                    }
                }
                .play-area-slide-enter-active, .play-area-slide-leave-active {
                    transition: all .3s ease;
                }
                .play-area-slide-enter, .play-area-slide-leave-to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
            .main-right {
                float: right;
                width: 585rem/@baseFontSize;
                .teacher-area {
                    .classroom {
                        button {
                            width: 100%;
                            height: 80rem/@baseFontSize;
                            background-image: url("./images/btn_bgc.png");
                            font-size:28rem/@baseFontSize;
                            border-radius:20rem/@baseFontSize;
                            border: 0;
                            outline: unset;
                            cursor: pointer;
                            background-size: cover;
                            background-color: unset;
                            color:rgba(255,255,255,1);
                            margin-bottom: 40rem/@baseFontSize;
                        }
                    }
                }
            }
            .main-bottom {
                width: 100%;
                height: 240rem/@baseFontSize;
                margin-top: 17rem/@baseFontSize;
                float: left;
                display: flex;
                .students-area {
                    display: flex;
                    > div {
                        margin-right: 120rem/@baseFontSize;
                        &:last-of-type {
                            margin-right: 0;
                        }
                    }
                }
                .placeholder {
                    flex: 1;
                    padding-left: 120rem/@baseFontSize;
                    img {
                        object-fit: cover;
                        height: 100%;
                        width: 100%;
                        border-radius: 10rem/@baseFontSize;
                    }
                }
            }
        }

    }
</style>
