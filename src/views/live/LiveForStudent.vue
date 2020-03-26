<template>
    <div class="live-container-student">
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
        <main ref="main" class="clearFix">
            <div class="main-left" ref="mainLeft">
                <div class="courseware-area" v-show="mode === 'game'">
                    <iframe :src="iframeSrc"
                            ref="iframe" allow="autoplay"></iframe>
                    <iframe :src="iframeSrcCache" style="display: none"
                            allow="autoplay"></iframe>
                </div>
                <div class="video-area" v-show="mode === 'video'" ref="video-area">
                    <video src="" ref="video-play" preload="auto" @ended="videoEnded"></video>
                </div>
                <div class="draw-area" ref="drawArea">
                    <div id="tui-image-editor" ref="drawArea" :class="{mouseStyle: shape === 'FREE_DRAWING'}"></div>
                </div>
                <div class="wrapper" ref="wrapper"></div>
            </div>
            <div class="main-right">
                <div class="teacher-area">
                    <div class="classroom">
                        <button @click="leaveRoom">离开教室</button>
                        <button>{{className + '《' + coursewareName + '》'}}</button>
                    </div>
                    <TeacherVideo :rtcRoom="rtcRoom" :teacherName="teacherName" :peerIdList="peerIdList" role="student"
                                  :stream="streamObj[teacherId]" :teacherId="teacherId"></TeacherVideo>
                </div>
            </div>
            <div class="main-bottom">
                <div class="students-area">
                    <StudentVideo :id="item.uid" :rtcRoom="rtcRoom" :studentName="item.uname" :stream="streamObj[item.uid]" @award="award"
                                  v-for="item in studentList" :key="item.uid" :info="item" role="student" :studentId="studentId"
                                  :roleInfo="roleInfoObj[item.uid]"></StudentVideo>
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
    const ImageEditor = require('tui-image-editor');
    // const ImageEditor = require('../../../../tui-image-editor/dist/tui-image-editor-copy.min'); // 将mousemove和mousedown挂载对象从document改到底层canvas
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
                firstLoad: true,
                didMounted: false, // 页面渲染完毕
                didJoinedRoom: false, // 进入课堂完成
                alertVisible: false, // 顶部提醒框
                alertMessage: '',
                showAnimateStar: false, // 控制星星显示
                animateStarSrc: animate_star,
                startStarAnimate: false, // 星星动画节流
                // -----------课件动画数据---------------
                coursewareResource: [],
                gameListIndex: [], // 存放游戏次序的数组
                gameIndex: 0,
                resourceIndex: 0, // 课件播放序号
                iframeSrc: '',
                iframeSrcCache: '',
                coursewareName: '',
                //-----------播放器控件数据---------------
                //-----------画板数据---------------
                imageEditor: null,
                shape: 'NORMAL', // NORMAL时可操作游戏 FREE_DRAWING画板 DELETE删除
                strokeWidth: 6,  //线宽
                strokeColor: '#ff0000', //线的颜色
                lineIdObj: {}, // 存储线ID
                // -----------rtcRoom数据---------------
                rtcRoom: null,
                peerIdList: [], // 学生的id
                roleInfoObj: {}, // 学生职位信息
                studentNameObj: {}, // 每个学生的姓名
                teacherId: '', // 老师id
                studentId: '',
                studentList: [],
                studentIdIndexObj: {}, // studentId与其在studentList对应的次序
                studentIdList: [], // 存放学生初次连接的id
                className: '',
                roomId: '',
                teacherName: '',
                streamObj: {}, // 视频流
                operating: false
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

                if (stageStatusArrLength === 1) {
                    const studentDomObj = document.querySelector('#studentVideo' + stageStatusArr[0])
                    const indexOfStudent = this.studentIdList.indexOf(stageStatusArr[0]) // 获取学生视频的次序，已确定左移距离
                    const translateTop = 783 + 17
                    studentDomObj.classList.add('oneStudentOnStage')
                    studentDomObj.classList.remove('moreStudentOnStage')
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
            this.didMounted = true;
            this.initDrawingBoard();
            this.stopMouseEventPropagation();
            // this.sendEventToIframe();
            if (this.didJoinedRoom) {
                this.getMessage()
            }
        },
        methods: {
            // 初始化
            async init () {
                // 载入本地存储
                this.$store.commit('readLiveBroadcastDataFromLocalStorage')

                // rem适配
                this.resize()

                // 获取课堂信息
                await this.queryClassInfo()

                // 初始化rtcROOM
                this.initRtcRoom()

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

            // 初始化rtcROOM
            initRtcRoom () {
                const rtcRoom = RTCRoom.getInstance()
                const host = 'www.9mankid.com'
                const port = 3210
                const roomId = this.$route.params.roomId // 9n474171ko mry79me13q
                // const peerId = (Math.ceil(Math.random() * 100) + 1).toString()
                const peerId = this.$route.params.studentId
                const userParams = {name: this.$route.params.name, headUrl: '', role: 2}
                this.studentId = peerId
                this.roomId = roomId
                const teacherId = this.teacherId = this.$route.params.teacherId
                this.className = this.$route.params.classname

                // 同步状态
                rtcRoom.on('message-notify-receive', (peerId, data) => {
                    console.log(data)
                    const event = data.event
                    if (event === 'live_sync') { // 同步基础数据
                        const result = data.data
                        // 同步页数
                        this.resourceIndex = result.sync.page
                        this.changeAnimate(true);
                        // 获取授权状态
                        const isAllOperate = result.isAllOperate
                        const operateId = result.operateId
                        if (isAllOperate) {
                            this.setAlert({visiable: true, message: `你可以操作游戏了`})
                            this.setPointerEvents(true)
                        }else {
                            if (result.isSingleOperate) {
                                if (operateId === this.studentId) {
                                    this.operating = true
                                    this.setPointerEvents(true)
                                    this.setAlert({visiable: true, message: `你可以操作游戏了`})
                                }else {
                                    this.operating = false
                                    this.setAlert({visiable: true, message: `学生 ${this.studentNameObj[operateId]} 正在操作游戏`})
                                }
                            }
                        }

                        // 上台状态
                        const singleVideoArr = result.singleVideoArr
                        this.$nextTick(function () {
                            singleVideoArr.forEach(item => {
                                const id = item
                                const videoBox = document.querySelector('#studentVideo' + id).parentElement
                                this.$store.commit('setStageStatus', {id, status: 1})
                                videoBox.classList.add('onStage')
                            })
                        })
                    }
                })

                rtcRoom.joinRoom(host,port,roomId,peerId,userParams);
                // this.iframeSrc = `/syncshuxe/start.html?path=3-1&roomId=${roomId}&peerId=${peerId}`
                this.rtcRoom = rtcRoom
                this.didJoinedRoom = true
                if (this.didMounted) {
                    this.getMessage()
                }

                // 用户加入时更新peerIdList
                rtcRoom.on('user-joined',(id) => {
                    console.log('用户进入：' + id)
                    this.$set(this.streamObj, id, null)
                    if (id === peerId) {
                        rtcRoom.getAllRoomUser().forEach(item => {
                            const peerId = item._peerId
                            if (peerId !== teacherId) {
                                this.peerIdList.push(peerId)
                            }
                        })
                        rtcRoom.requestRoomInfo('user_sort', {});
                        rtcRoom.requestRoomInfo('ai_role_info', {});
                        rtcRoom.requestRoomInfo('room_config', {manager: teacherId});

                        this.$set(this.studentList[this.studentIdIndexObj[id]], 'joinRoom', true)
                        this.$set(this.studentList[this.studentIdIndexObj[id]], 'isconnect', true)
                    }
                    if (!this.peerIdList.includes(id) && id !== teacherId) {
                        this.peerIdList.push(id)
                    }
                })

                //用户连接成功成功时设置用户状态
                rtcRoom.on('user-peer-connected',(id) => {
                    console.log('用户连接：' + id)
                    if (id !== this.teacherId) {
                        // rtcRoom.closeVideo(this.studentId, [this.teacherId])
                        rtcRoom.requestRoomInfo('user_sort', {});
                        const videoBox = document.querySelector('#studentVideo' + id).parentElement
                        this.$set(this.studentList[this.studentIdIndexObj[id]], 'joinRoom', true)
                        this.$set(this.studentList[this.studentIdIndexObj[id]], 'isconnect', true)
                        // 防止class被重置
                        if (videoBox.classList.contains('onStage')) {
                            this.$nextTick(function () {
                                videoBox.classList.add('onStage')
                            })
                        }
                    }
                })

                // 用户离开时更新peerIdList
                rtcRoom.on('user-leaved',(id) => {
                    console.log('用户离开：' + id, this.peerIdList.indexOf(id))
                    const index = this.peerIdList.indexOf(id)
                    if (index !== -1) {
                        this.$set(this.studentList[this.studentIdIndexObj[id]], 'isconnect', false)
                        this.peerIdList.splice(index, 1)
                        this.$store.commit('setPeerIdList', this.peerIdList)
                        this.$store.commit('resetStatus', id)
                        const studentVideo = document.querySelector('#studentVideo' + id)
                        studentVideo.style = ''
                    }else { // 老师离开取消授权和上台
                        rtcRoom.changeAISyncStatus(1); // 取消全体授权
                        rtcRoom.changeAIControl(id)
                        // 取消单人授权
                        if (this.operating) {
                            this.$message.warning('你不能再操作游戏了', 5)
                            this.operating = false
                        }
                        this.setPointerEvents(false)

                        this.setAlert({visiable: false, message: ''})
                        // 全部下台
                        this.studentList.forEach(item => {
                            if (item.isconnect) {
                                const id = item.uid
                                const videoBox = document.querySelector('#studentVideo' + id).parentElement
                                if (videoBox.classList.contains('onStage')) {
                                    videoBox.classList.remove('onStage')
                                    videoBox.children[0].style.top = ''
                                    videoBox.children[0].style.left = ''
                                }
                            }
                        })
                        this.$store.commit('setStageStatusSortByStage', [])
                    }
                });

                rtcRoom.on('media-receive', (peerId, stream) => {
                    this.$set(this.streamObj, peerId, stream)
                })

                // 获取学生职位
                rtcRoom.on('ai-action-notify', (method,data) => {
                    this.$set(this.roleInfoObj, data.peerId, {src: data.midpath + data.path})
                })

                // 获取学生次序
                rtcRoom.on('room-info-notify',(method,data) => {
                    if (method === 'user_sort') {
                        const list = data.list
                        const indexOfTeacher = list.indexOf(this.teacherId)
                        if (indexOfTeacher !== -1) {
                            list.splice(indexOfTeacher, 1)
                        }
                        if (JSON.stringify(this.studentIdList) === JSON.stringify(list)) return
                        this.studentIdList = list
                        this.$store.commit('setStudentIdList', list)
                        // 处理学生顺序
                        const studentIdObj = {}
                        const studentIdOldIndexObj = {} // 旧次序
                        const cacheStudentList = []
                        this.studentList.forEach((item, index) => {
                            studentIdOldIndexObj[item.uid] = index
                        })
                        list.forEach((item, index) => {
                            studentIdObj[item] = index
                            if(studentIdOldIndexObj[item] !== undefined) {
                                cacheStudentList[index] = this.studentList[studentIdOldIndexObj[item]]
                            }
                        })

                        this.studentList = cacheStudentList
                        this.studentIdIndexObj = studentIdObj
                    }else if (method === 'ai_role_info') {
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
                    rtcRoom.leaveRoom();
                }
            },

            // 离开房间
            leaveRoom () {
                const rtcRoom = this.rtcRoom
                this.$confirm({
                    title: '确定要退出房间吗?',
                    content: '',
                    centered: true,
                    onOk:() => {
                        rtcRoom.leaveRoom();
                        localStorage.removeItem('9manLiveBroadcast');
                        window.close();
                    },
                    onCancel() {},
                });
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
                            this.coursewareName = data.data.data.name
                            this.coursewareResource = data.data.data.courseware_resource
                            const gameListIndex = []
                            this.coursewareResource.forEach((item, index) => {
                                if (item.type === 2) {
                                    gameListIndex.push(index)
                                }
                            })
                            this.gameListIndex = gameListIndex
                            this.changeAnimate(true) // 载入课件
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
                            const localStudentIdList = this.$store.state.liveBroadcast.liveBroadcastData.studentIdList
                            studentList.forEach((item, index) => {
                                this.studentNameObj[item.uid] = item.uname
                                this.studentIdIndexObj[item.uid] = index
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
                        rotatingPointOffset: 70,
                        borderColor: '#000',
                    }
                });
                this.imageEditor = instance;
            },

            // 阻止该组件的鼠标事件传递到document，影响画图
            stopMouseEventPropagation () {
                const liveContainer = document.querySelector('.live-container-student')
                liveContainer.onmousedown = function (e) {
                    e.stopPropagation()
                }
                liveContainer.onmousemove = function (e) {
                    e.stopPropagation()
                }
                liveContainer.onmouseup = function (e) {
                    e.stopPropagation()
                }
            },

            // 当处于课件操作状态时，将wrapper中的事件传发到iframe
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

            // 设置点击穿透
            setPointerEvents (status) {
                const drawArea = this.$refs.drawArea
                const wrapper = this.$refs.wrapper
                if (status) {
                    drawArea.style.pointerEvents = 'none'
                    wrapper.style.pointerEvents = 'none'
                }else {
                    drawArea.style.pointerEvents = 'auto'
                    wrapper.style.pointerEvents = 'auto'
                }
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
                if (this.shape !== 'NORMAL') {
                    this.stopDrawing();
                }
                imageEditor.removeActiveObject();
            },

            //清除所有
            clearAll () {
                const imageEditor = this.imageEditor;
                imageEditor.clearObjects();
                imageEditor._graphics._canvas.deactivateAll();
                imageEditor._graphics._canvas.renderAll();
            },

            // 显示隐藏画板
            changeDrawStatus(status) {
                this.shape = status;
                if (status === 'FREE_DRAWING') {
                    this.drawByShape();
                } else if (status === 'NORMAL') {
                    this.stopDrawing();
                } else if (status === 'DELETE') {
                    this.eraser();
                }
            },

            // 设置提醒框
            setAlert (data) {
                this.alertVisible = data.visiable
                this.alertMessage = data.message
            },

            // 视频播放结束
            videoEnded (e) {
                const video = e.target
                video.currentTime = 0
            },

            // 切换动画
            changeAnimate () {
                const courseware = this.coursewareResource[this.resourceIndex]
                const type = courseware.type
                const url = courseware.url
                const resourceUrl = this.$store.state.resourceUrl
                this.gameCache()
                const video = this.$refs['video-play']
                video.pause();
                if (type === 1) { // 视频
                    this.mode = 'video'
                    video.src = resourceUrl + '/' + url
                    this.clearAll()
                }else if (type === 2) { // 动画
                    this.mode = 'game'
                    this.iframeSrc = resourceUrl + '/' + url + `&roomId=${this.roomId}&peerId=` + this.studentId
                    this.clearAll()
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

            // 发放奖励
            award () {
                const starDom = document.querySelector('#studentVideo' + this.studentId + ' .star')
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                const rect = starDom.getBoundingClientRect()
                const height = rect.height
                const width = rect.width
                const bottom = rect.bottom
                const right = rect.right
                if (this.startStarAnimate) return
                this.startStarAnimate = true
                const clientX = right - width / 2
                const clientY = bottom - height / 2
                const moveStar = this.$refs.moveStar
                const _this = this
                moveStar.classList.add('move')

                setTimeout(() => {
                    _this.animateStarSrc = animate_star
                    this.showAnimateStar = true
                }, 500)
                setTimeout(() => {
                    this.showAnimateStar = false
                    this.animateStarSrc = ''
                    moveStar.style.left = clientX + 'px'
                    moveStar.style.bottom = document.querySelector('.live-container-student').offsetHeight - clientY - scrollTop + 'px'
                    moveStar.style.transform = `translate(-50%, 50%) scale(0) rotate(3600deg)`
                    moveStar.addEventListener('transitionend', transitionend)
                }, 2500)

                function transitionend() {
                    moveStar.style.left = ''
                    moveStar.style.bottom = ''
                    moveStar.style.transform = ''
                    moveStar.classList.remove('move')
                    _this.startStarAnimate = false
                    moveStar.removeEventListener('transitionend', transitionend)
                }
            },

            //接收画图数据，建立连接
            getMessage () {
                const upperCanvas = document.querySelector('.upper-canvas');
                const canvas = document.querySelector('#tui-image-editor');
                const main = this.$refs.main;
                const video = this.$refs['video-play'];
                const lineIdObj = this.lineIdObj;
                const mouseEvent = document.createEvent("MouseEvents"); // 模拟鼠标点击
                let path = null; // 线条路径
                let index = 0; // 完成绘制的点序号
                let lineIdList = []; // 存储选中的线条

                this.rtcRoom.on('message-receive', res => {
                    const event = res.event
                    const data = res.data
                    console.log(res)
                    switch (event) {
                        case 'show_content_change': // 更换页码
                            this.resourceIndex = data.sync.page
                            this.changeAnimate()
                            break;
                        case 'media_controll': // 控制视频播放
                            const isplay = data.isplay
                            if (isplay) {
                                video.play()
                            }else {
                                video.pause()
                            }
                            break;
                        case 'player_seek_to_value': // 控制视频进度
                            const progress = data.value
                            video.currentTime = progress * video.duration
                            break;
                        case 'add_line': // 处理画板数据
                            path = data.pointlist
                            this.drawCurve()
                            if (!lineIdObj[data.lineId]) { // id不存在则开始画新的线
                                let size = this.getDrawBoardSize(data, canvas)
                                mouseEvent.initMouseEvent("mousedown", true, true, document.defaultView, 0, 0, 0,
                                    path[index][0] * size.canvasScale - size.scrollLeft,
                                    path[index][1] * size.canvasScale - size.scrollTop,
                                    false, false, false, false, 0, null)
                                upperCanvas.dispatchEvent(mouseEvent)
                                lineIdObj[data.lineId] = true
                                index++
                                this.drawCurve()
                            } else {
                                for (index; index < path.length; index++) {
                                    let size = this.getDrawBoardSize(data, canvas)
                                    mouseEvent.initMouseEvent("mousemove", true, true, document.defaultView, 0, 0, 0,
                                        path[index][0] * size.canvasScale - size.scrollLeft,
                                        path[index][1] * size.canvasScale - size.scrollTop,
                                        false, false, false, false, 0, null)
                                    document.dispatchEvent(mouseEvent)
                                }
                            }
                            if (data.finished) {
                                index--
                                let size = this.getDrawBoardSize(data, canvas)
                                mouseEvent.initMouseEvent("mouseup", true, true, document.defaultView, 0, 0, 0,
                                    path[index][0] * size.canvasScale - size.scrollLeft,
                                    path[index][1] * size.canvasScale - size.scrollTop,
                                    false, false, false, false, 0, null)
                                document.dispatchEvent(mouseEvent)
                                index = 0

                                // 记录实际画板中线的id
                                const objects = this.imageEditor._graphics._objects
                                const objectsIdArr = Object.keys(objects)
                                lineIdObj[data.lineId] = parseInt(objectsIdArr[objectsIdArr.length - 1])

                                this.imageEditor.stopDrawingMode() //即时更换线条颜色
                                this.drawCurve()
                            }
                            break;
                        case 'select_line': // 选中线条对象
                            this.stopDrawing();
                            let size = this.getDrawBoardSize(data, canvas)
                            const startPoint = data.startPoint
                            mouseEvent.initMouseEvent(data.action, true, true, document.defaultView, 0, 0, 0,
                                startPoint[0] * size.canvasScale - size.scrollLeft,
                                startPoint[1] * size.canvasScale - size.scrollTop,
                                false, false, false, false, 0, null)
                            if (data.action === 'mousedown') {
                                upperCanvas.dispatchEvent(mouseEvent)
                            } else {
                                document.dispatchEvent(mouseEvent)
                            }
                            break;
                        case 'delete_line': // 删除线条
                            if (data.source === 'web') {
                                this.imageEditor.removeActiveObject()
                            } else {
                                const length = lineIdList.length
                                let index = 0
                                const deleteLine  = () => {
                                    if (index < length) {
                                        this.imageEditor.removeObject(lineIdObj[lineIdList[index]])
                                            .then(() => {
                                                index ++
                                                deleteLine()
                                            })
                                    }
                                }
                                deleteLine()
                            }
                            break;
                        case 'delete_line_choose_add': // 已选择的线条
                            lineIdList = data.lineIds
                            break;
                        case 'delete_line_choose_cancel': // 取消选中
                            this.imageEditor._graphics._canvas.deactivateAll();
                            this.imageEditor._graphics._canvas.renderAll();
                            break;
                        case 'single_operations': // 授权
                            const peerId = data.peerId
                            if (!peerId) {
                                if (this.operating) {
                                    this.$message.warning('你不能再操作游戏了', 5)
                                    this.operating = false
                                }
                                this.setPointerEvents(false)

                                this.setAlert({visiable: false, message: ''})
                                break;
                            }
                            if (peerId === this.studentId) {
                                this.operating = true
                                this.setPointerEvents(true)
                                this.setAlert({visiable: true, message: `你可以操作游戏了`})
                            }else {
                                this.operating = false
                                this.setPointerEvents(false)
                                this.setAlert({visiable: true, message: `学生 ${this.studentNameObj[peerId]} 正在操作游戏`})
                            }
                            break;
                        case 'all_operations': // 全部授权
                            const operations = data.operations
                            this.operating = operations
                            if (operations) {
                                this.setAlert({visiable: true, message: `你可以操作游戏了`})
                                this.setPointerEvents(true)

                            }else {
                                this.operating = false
                                this.setPointerEvents(false)
                                this.setAlert({visiable: false, message: ''})
                                this.$message.warning('你不能再操作游戏了', 5)
                            }
                            break;
                        case 'single_video': // 上台
                            let id = data.peerId
                            const status = data.appear
                            const videoBox = document.querySelector('#studentVideo' + id).parentElement
                            this.$store.commit('setStageStatus', {id, status: status? 1: 2})
                            if (status) {
                                videoBox.classList.add('onStage')
                            } else {
                                videoBox.classList.remove('onStage')
                                videoBox.children[0].style.top = ''
                                videoBox.children[0].style.left = ''
                            }
                            break;
                        case 'all_video': // 上台
                            const allStatus = data.video

                            this.studentList.forEach(item => {
                                if (item.isconnect) {
                                    const id = item.uid
                                    const videoBox = document.querySelector('#studentVideo' + id).parentElement
                                    if (!allStatus) { // 取消所有学生上台
                                        videoBox.classList.remove('onStage')
                                        videoBox.children[0].style.top = ''
                                        videoBox.children[0].style.left = ''
                                    } else {
                                        videoBox.classList.add('onStage')
                                    }
                                }
                            })
                            if (allStatus) {
                                this.$store.commit('setStageStatusSortByStage', this.peerIdList)
                            }else {
                                this.$store.commit('setStageStatusSortByStage', [])
                            }
                            break;
                        case 'award': // 奖励
                            if (data.id === this.studentId) {
                                this.award()
                            }
                            break;
                    }
                });
            },

            // 获取画板基础尺寸
            getDrawBoardSize (data, canvas) {
                return {
                    scrollLeft: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
                    scrollTop: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
                    canvasScale: canvas.offsetWidth / data.hbsize[0]
                }
            }
        }
    }
</script>

<style lang="less">
    @import "../../less/index";
    .live-container-student {
        background:rgba(248,209,194,1);
        padding: 20rem/@baseFontSize 140rem/@baseFontSize;
        min-height: 100%;
        position: relative;
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
                .wrapper {
                    width: 100%;
                    height: 100%;
                    border-radius:10rem/@baseFontSize;
                    position: absolute;
                    left: 0;
                    right: 0;
                    z-index: 99;
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
                            &:last-of-type {
                                background-image: unset;
                                background-color: #fff;
                                font-size:26rem/@baseFontSize;
                                color:rgba(27,27,27,1);
                                cursor: default;
                            }
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
