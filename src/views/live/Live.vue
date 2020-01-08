<template>
    <div class="live-container">
        <main>
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
                <div class="draw-area" v-show="showDrawArea">
                    <div id="tui-image-editor" ref="drawArea"></div>
                </div>
                <div class="operate-area">
                    <div :class="{default: true, active: !showDrawArea}" @click="changeDrawStatus(false)">
                        <icon-font type="iconuf00db"/>
                    </div>
                    <div class="pen" :class="{default: true, active: showDrawArea}" @click="changeDrawStatus(true)">
                        <icon-font type="iconpen"/>
                    </div>
                    <div class="delete" @click="eraser">
                        <icon-font type="iconsystem-deleteb" />
                    </div>
                    <div class="previous-page" @click="changeAnimate($event, 0)">
                        <a-tooltip placement="right" :visible="firstPageTip">
                            <template slot="title">
                                <span>已经是第一页了</span>
                            </template>
                            <a-icon type="step-backward" />
                        </a-tooltip>
                    </div>
                    <div class="next-page" @click="changeAnimate($event, 2)">
                        <a-tooltip placement="right" :visible="lastPageTip">
                            <template slot="title">
                                <span>已经是最后一页了</span>
                            </template>
                            <a-icon type="step-backward" />
                        </a-tooltip>
                    </div>
                </div>
                <transition name="play-area-slide">
                    <div class="play-area" v-show="showPlayArea && mode === 'video'">
                        <span class="play" @click="videoPlay" ref="play"></span>
                        <a-slider id="test" @change="videoPause" ref="slider"
                                  v-model="progressBar" @afterChange="changeVideoProgress"/>
                    </div>
                </transition>
            </div>
            <div class="main-right">
                <div class="teacher-area">
                    <div class="classroom">
                        <button>离开教室</button>
                        <button>开始上课</button>
                    </div>
                    <TeacherVideo :rtcRoom="rtcRoom" :teacherName="teacherName" :peerIdList="peerIdList" :stream="streamObj[teacherId]"></TeacherVideo>
                </div>
            </div>
            <div class="main-bottom">
                <div class="students-area"></div>
            </div>
        </main>
    </div>
</template>

<script>
    import { Icon } from 'ant-design-vue';
    var ImageEditor = require('tui-image-editor');
    import 'tui-image-editor/dist/tui-image-editor.css';
    import exampleImg from './images/example.png';

    // 导入socket
    import RTCRoom from '@/lib/RTCRoomSDK/RTCRoomManager';

    // 导入直播组件
    import TeacherVideo from '@/components/live/TeacherVideoForTeacher'

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
                showDrawArea: false, // 画板的显示与隐藏
                mikeStatus: true, // 开启麦克风
                videoAreaWidth: '33%', // 播放区域宽度
                studentVideoScale: 1, // 学生区域缩放倍数
                firstLoad: true,
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
                shape: 'FREE_DRAWING',
                strokeWidth: 11,  //线宽
                strokeColor: '#2E3E50', //线的颜色
                // -----------rtcRoom数据---------------
                rtcRoom: null,
                peerIdList: [], // 学生的id
                studentNameObj: {}, // 每个学生的姓名
                teacherId: '', // 老师id
                roomId: '',
                teacherName: '',
                streamObj: {}, // 视频流
                // -----------右侧工具栏数据---------------
                firstPageTip: false,
                lastPageTip: false,
            }
        },
        components: {
            IconFont,
            TeacherVideo
        },
        created() {
            this.init();
        },
        mounted() {
            this.controlPlayArea();
            this.initDrawingBoard();
        },
        methods: {
            // 初始化
            init () {
                // 载入本地存储
                this.$store.commit('readLiveBroadcastDataFromLocalStorage')

                // rem适配
                this.resize()

                // 初始化rtcROOM
                this.initRtcRoom()

                // 还原教师页面
                this.recoverPage()

                // 获取课件信息
                this.getCoursewareInfo(this.$route.params.coursewareId)
            },

            // 动态改变rem值
            resize () {
                const baseScreenWidth = 1920;
                const baseFontSize = 100;
                const screenWidth = window.innerWidth;
                const baseDrawingBoardWidth = 1271;
                const baseDrawingBoardHeight = 783;
                document.documentElement.style.fontSize = screenWidth / baseScreenWidth * baseFontSize + 'px';
                window.onresize =  () => {
                    const screenWidth = window.innerWidth;
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
                this.teacherName = userParams.name
                // 设置iframeSrc
                // this.iframeSrc = `https://www2.9man.com/syncshuxe/start.html?path=3-1&roomId=${roomId}&peerId=${teacherPeerId}&manager=1`

                // this.peerIdList = ['2', '3']

                // 用户加入时更新peerIdList
                rtcRoom.on('user-joined',(id) => {
                    console.log('用户进入：' + id)
                    this.streamObj[id] = null;
                    if (id === teacherPeerId) {
                        rtcRoom.getAllRoomUser().forEach(item => {
                            const peerId = item._peerId
                            if (peerId !== teacherPeerId) {
                                this.studentNameObj[peerId] = item.name
                                this.peerIdList.push(peerId)
                            }
                        })
                    }
                    if (!this.peerIdList.includes(id) && id !== teacherPeerId) {
                        const info = rtcRoom.getRoomUser(id);
                        this.studentNameObj[id] = info.name
                        this.peerIdList.push(id)
                    }
                    this.$store.commit('setPeerIdList', this.peerIdList)
                })


                //用户连接成功成功时设置用户状态
                rtcRoom.on('user-peer-connected',(id) => {
                    console.log('用户连接：' + id)
                    if (id === teacherPeerId) return
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
                        rtcRoom.closeAudio(id)
                        this.$store.commit('setAudioStatus', {id: id, status: 2})
                    }

                    // 处理操作状态
                    const userControlStatus = liveBroadcastData.controlStatus[id]
                    const params = {
                        type: 'controlStudentOperate',
                        event: 'single_operations',
                        data: {
                            sync: {
                                page: this.resourceIndex,
                                type: this.mode === 'draw'? 1: 0
                            }
                        }
                    }
                    if (userControlStatus) {
                        if (userControlStatus === 1) {
                            Object.assign(params.data, {peerId: id})
                        } else if (userControlStatus === 2) {
                            Object.assign(params.data, {peerId: '0'})
                        }
                        rtcRoom.notifyMessage(params, '__all')
                    } else {
                        Object.assign(params.data, {peerId: '0'})
                        rtcRoom.notifyMessage(params, '__all')
                        this.$store.commit('setControlStatus', {id: id, status: 2})
                    }

                    // 处理学生上台状态
                    const stageStatus = liveBroadcastData.stageStatus
                    const studentOnStageId = stageStatus? stageStatus.id: ''
                    const studentOnStageType = stageStatus? stageStatus.videoType: ''
                    // if (studentOnStageId && studentOnStageId === id) {
                    //     if (studentOnStageType === 'small') {
                    //         this.onStage(studentOnStageId, true)
                    //     }else if (studentOnStageType === 'big') {
                    //         this.onStageForBig(studentOnStageId, true)
                    //     }
                    // }

                    // this.synchronize(id) // 同步数据到移动端
                });

                // 用户离开时更新peerIdList
                rtcRoom.on('user-leaved',(id) => {
                    console.log('用户离开：' + id, this.peerIdList.indexOf(id))
                    delete this.studentNameObj[id]
                    const index = this.peerIdList.indexOf(id)
                    if (index !== -1) {
                        this.peerIdList.splice(index, 1)
                        this.$store.commit('setPeerIdList', this.peerIdList)
                    }

                });

                rtcRoom.on('media-receive', (peerId, stream) => {
                    console.log('peerId:' + peerId)
                    this.$set(this.streamObj, peerId, stream)
                })

                this.rtcRoom = rtcRoom
                this.$store.commit('setRtcRoom', rtcRoom)
            },

            // 还原老师掉线前状态
            recoverPage () {
                const liveBroadcastData = this.$store.state.liveBroadcast.liveBroadcastData
                const mode = liveBroadcastData.mode
                if (!mode) { // 无本地缓存时
                    this.firstLoad = false
                }else {
                    this.mode = mode
                }
                this.resourceIndex = liveBroadcastData.coursewarePage? liveBroadcastData.coursewarePage: 0
            },

            // 当学生连接时同步状态
            synchronize(userId) {
                const studentOnStageType = this.studentOnStageType
                const id = this.dragVideoId
                const params = {
                    type: 'synchronize',
                    values: {
                        strokeWidth: this.strokeWidth,
                        strokeColor: this.strokeColor,
                        fill: this.fill,
                        mode: this.mode,
                        showPicture: !this.showPicture,
                        shape: this.shape,
                        drawingShape: this.drawingShape,
                        resourceIndex: this.resourceIndex
                    },
                    event: 'live_sync',
                    data: {
                        type: this.mode === 'picture'? 1: 0,
                        time: 240,
                        "animate_page": this.resourceIndex,
                        "multiMedia_page": 0,
                        sync: {
                            page: this.resourceIndex,
                            type: this.mode === 'picture'? 1: 0
                        },
                        stagePeer: id,
                        isBig: studentOnStageType === 'big',
                        isplay: !(studentOnStageType === '')
                    }
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
                        cornerSize: 20,
                        rotatingPointOffset: 70
                    }
                });
                this.imageEditor = instance;
                const _this = this;
                const canvas = document.querySelector('#tui-image-editor');
                const upperCanvas = document.querySelector('.upper-canvas');

                //鼠标点击事件
                instance.on('mousedown', function(event, originPointer) {
                    const e = {
                        screenX: event.screenX,
                        screenY: event.screenY,
                        clientX: event.layerX,
                        clientY: event.layerY,
                    }

                    // let startPoint = [originPointer.x, originPointer.y]
                    // const mobileDeviceData = { // 传给移动设备的数据
                    //     sync:{
                    //         page: this.resourceIndex,
                    //         type: this.mode === 'picture'? 1: 0
                    //     },
                    //     shape: mobileDrawShape,
                    //     hbsize: [1152, 710],
                    //     line: _this.strokeWidth,
                    //     color: _this.strokeColor,
                    //     pointlist: [startPoint],
                    //     text: '',
                    //     peerId: _this.teacherId
                    // }
                    // const params = {
                    //     type: 'mousedown',
                    //     canvasWidth: canvas.offsetWidth,
                    //     e
                    // }
                    _this.drawByShape();
                    // _this.sendDrawData(params)

                    //鼠标移动事件
                    canvas.onmousemove = function (event) {
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.layerX,
                            clientY: event.layerY,
                        }
                        // let endPoint = []
                        // const params = {
                        //     type: 'mousemove',
                        //     canvasWidth: canvas.offsetWidth,
                        //     e
                        // }
                        // if (shape === 'FREE_DRAWING') {
                        //     endPoint = [event.layerX, event.layerY]
                        //     mobileDeviceData.pointlist = [startPoint, endPoint]
                        //     startPoint = endPoint
                        //     Object.assign(params, { data: mobileDeviceData, event: 'draw'})
                        // }
                        //
                        // _this.sendDrawData(params)
                    };
                    //鼠标抬起事件
                    document.onmouseup = function (event) {
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.layerX,
                            clientY: event.layerY,
                        }
                        // let endPoint = [event.layerX, event.layerY]
                        // mobileDeviceData.pointlist = [startPoint, endPoint]
                        // const params = {
                        //     data: mobileDeviceData,
                        //     event: 'draw',
                        //     type: 'mouseup',
                        //     canvasWidth: canvas.offsetWidth,
                        //     e
                        // }
                        // _this.sendDrawData(params)
                        instance.stopDrawingMode(); //即时更换线条颜色
                        _this.drawByShape();
                        canvas.onmousemove = null;
                        document.onmouseup = null;

                        // 因修改此插件源码中fabric的mouseup触发对象，因此加了个模拟鼠标事件，以防止鼠标移除画布时的bug
                        const newEvent = document.createEvent("MouseEvents");
                        newEvent.initMouseEvent("mouseup", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            e.clientX, e.clientY, false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(newEvent);
                    }
                });
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
                this.shape = 'NORMAL';
                imageEditor.changeCursor('default');
                // const params = {
                //     type: 'stopDrawing'
                // }
                // this.sendDrawData(params)
            },

            //橡皮擦功能
            eraser () {
                const imageEditor = this.imageEditor;
                if (this.shape !== 'NORMAL') {
                    this.stopDrawing();
                }
                imageEditor.removeActiveObject();

                // 发送删除图形请求
                // const params = {
                //     type: 'ERASER',
                //
                // };
                // this.sendDrawData(params);
            },

            //清除所有
            clearAll () {
                const imageEditor = this.imageEditor;
                imageEditor.clearObjects();

                // 发送清除图形请求
                // const params = {
                //     type: 'CLEARALL',
                //     event: 'clear'
                // };
                // this.sendDrawData(params);
            },

            //发送画图数据
            sendDrawData (params) {
                Object.assign(params, {id: this.teacherId})
                this.rtcRoom.sendMessage(params)
            },

            // 显示隐藏画板
            changeDrawStatus(status) {
                this.showDrawArea = status;
                if (status) {
                    this.shape = 'FREE_DRAWING';
                    this.drawByShape();
                } else {
                    this.stopDrawing();
                }
            },

            // 视频播放功能
            videoPlay () {
                if (this.mode !== 'video') return
                const video = this.$refs['video-play']
                const play = this.$refs['play']
                play.classList.toggle('pause')
                if (video.paused) {
                    video.play();
                    this.sendMediaData(0, true)
                }else {
                    video.pause();
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
                if (video.paused) {
                    video.play()
                    play.classList.add('pause')
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
                        type: 'control_video_progress',
                        progress,
                        data: {
                            value: progress,
                            sync: {
                                type,
                                page: this.resourceIndex
                            }
                        }
                    }
                }else {
                    params = {
                        event: 'media_controll',
                        type: 'control_video_play',
                        isplay,
                        data: {
                            isplay,
                            sync: {
                                type,
                                page: this.resourceIndex
                            }
                        }
                    }
                }
                this.rtcRoom.sendMessage(params)
            },

            // 切换动画
            changeAnimate (e, direction, firstLoad) {
                const length = this.coursewareResource.length - 1
                let index = this.resourceIndex
                if (direction === 2) { // 动画前进
                    // if (index >= length) {
                    //     this.resourceIndex = 0
                    //     this.changeAnimate(this.$event, 1)
                    //     return
                    // }
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
                    // if (index <= 0) {
                    //     this.resourceIndex = length
                    //     this.changeAnimate(this.$event, 1)
                    //     return
                    // }
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
                if (type === 1) { // 视频
                    this.$store.commit('setOperatePermission', false)
                    this.mode = firstLoad? this.mode: 'video'
                    const video = this.$refs['video-play']
                    video.src = resourceUrl + '/' + url
                    const play = this.$refs['play']
                    play.classList.remove('pause')
                    video.pause();
                }else if (type === 2) { // 动画
                    this.$store.commit('setOperatePermission', true)
                    this.mode = firstLoad? this.mode: 'game'
                    this.iframeSrc = resourceUrl + '/' + url + `&roomId=${this.roomId}&peerId=` + this.teacherId + '&manager=1'
                }
                // this.sendMediaData(0, false)
                // const params = {
                //     type: 'animate_page_change',
                //     event: 'show_content_change',
                //     data: {
                //         page: this.resourceIndex,
                //         type: 0
                //     },
                //     page: this.resourceIndex
                // }
                // this.$store.commit('setCoursewarePage', this.resourceIndex)
                // if (!firstLoad) {
                //     this.rtcRoom.sendMessage(params)
                // }
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

        }
    }
</script>

<style lang="less">
    @import "../../less/index";
    .live-container {
        background:rgba(248,209,194,1);
        padding: 20rem/@baseFontSize;
        main {
            overflow: hidden;
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
                    padding: 0 6rem/@baseFontSize;
                    display: flex;
                    justify-content: space-evenly;
                    flex-direction: column;
                    z-index: 999;
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
                        &:nth-of-type(1), &:nth-of-type(2) {
                            &:hover, &.active {
                                background-color: #F85715;
                                i {
                                    color: #fff;
                                }
                            }
                        }
                        &:nth-of-type(n + 3) {
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
                            margin-bottom: 65rem/@baseFontSize;
                        }
                    }
                }
            }
        }

    }
</style>
