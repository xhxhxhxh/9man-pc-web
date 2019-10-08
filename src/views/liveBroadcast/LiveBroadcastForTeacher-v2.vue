<template>
    <div class="LiveBroadcast-container" @drop="removeDragStudentVideo" @dragover.prevent="() => {}">
        <div class="statusBar">
            <div class="deviceInfo">
                <div class="netStatus">
                    <span>网络状态:</span>
                    <NetStatus></NetStatus>
                </div>
                <div class="mikeStatus">
                    <span>麦克风:</span>
                    <MikeStatus :openMike="mikeStatus"></MikeStatus>
                </div>
                <div class="speakerStatus">
                    <span>扬声器:</span>
                    <Speaker></Speaker>
                </div>
            </div>
            <div class="className">
                <span> L1  0730班  某某课</span>
            </div>
            <div class="startClass">
                <span class="time">01:50:30</span>
                <a-button>开始上课</a-button>
                <img src="./images/exit.png" alt="" @click="leaveRoom">
            </div>
        </div>
        <main class="clearfix" ref="main">
            <div class="videoArea" :style="{width: videoAreaWidth}" v-show="!$store.getters.controlAllStatus || peerIdList.length <= 1">
                <div class="video-teacher" v-show="showPicture">
                    <TeacherVideo @pictureCovered="pictureCovered" :rtcRoom="rtcRoom" :teacherName="teacherName" :peerIdList="peerIdList"></TeacherVideo>
                </div>
                <div class="video-students">
                    <p class="title" v-show="showPicture">班级成员：</p>
                    <StudentVideo :id="id" @startDragVideo="startDragVideo" :rtcRoom="rtcRoom"
                                  @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"
                                  :studentName="studentNameObj[id]" v-for="id in peerIdList" :key="id" @dropIn="videoDropIn" :peerIdList="peerIdList"></StudentVideo>
                    <p class="operateStudentsVideo" v-show="!showPicture">
                        <button @click="cancelPictureCovered"><img src="./images/cover.png" alt="">取消铺满</button>
                        <button :class="{muteAll: !$store.getters.updateAudioStatus, mute: true}" @click="$store.commit('updateAudioStatusAll')">
                            <img :src="muteSrc" alt="">{{muteText}}
                        </button>
                        <button :class="{controlAll: $store.getters.controlAllStatus, control: true}" @click="$store.commit('updateControlStatusAll')" >
                            <img :src="controlSrc" alt="">{{controlText}}
                        </button>
                    </p>
                </div>
            </div>
            <div class="playArea" v-show="showPicture && (!$store.getters.controlAllStatus || peerIdList.length <= 1)" @drop.stop="videoDropIn" @dragover.prevent="() => {}" ref="playArea">
                <div class="load-image" v-if="showLoadImage && mode !== 'animate'">
                    <a-upload
                            name="image"
                            listType="picture-card"
                            class="avatar-uploader"
                            :showUploadList="false"
                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            :beforeUpload="beforeUploadImage"
                    >
                        <div>
                            <a-icon :type="loading ? 'loading' : 'plus'" />
                            <div class="ant-upload-text">点击本地上传</div>
                        </div>
                    </a-upload>
                </div>
                <div class="video-area" v-show="mode === 'video'" ref="video-area">
                    <video src="" ref="video-play" poster="./images/loading.gif" @timeupdate="videoTimeupdate" @ended="videoEnded"></video>
                </div>
                <div id="tui-image-editor" ref="editArea" v-show="mode === 'picture'"></div>
                <div class="wrapper" v-show="showWrapper && mode === 'animate'"></div>
                <div class="animate-area" v-show="mode === 'animate'" ref="animateArea">
                    <iframe :src="iframeSrc" ref="iframe"></iframe>
                </div>
                <div class="operate">
                    <div class="mode-animate" v-show="mode !== 'picture'">
                        <span class="play" @click="videoPlay" ref="play" :class="{disable: mode === 'animate'}"></span>
                        <a-slider id="test" :defaultValue="0" :disabled="disabled"
                                  v-model="progressBar" @change="changeVideoProgress"/>
                        <span class="back" @click="changeImage($event, 0)"></span>
                        <span class="fast-forward" @click="changeImage($event, 2)"></span>
                        <span class="skip"></span>
                    </div>
                    <div class="mode-picture" v-show="mode === 'picture' && mode !== 'video'">
                        <div class="draw-operate">
                            <div :class="{pencil: true, selected: shape === 'LINE_DRAWING' || shape === 'FREE_DRAWING'}"
                                 @mouseenter="showPencilItem = true" @mouseleave="showPencilItem = false"
                                 @click="() => {shape === 'FREE_DRAWING'? stopDrawing(): shape = 'FREE_DRAWING'; drawByShape(); trigger(shape)}">
                                <div class="pencil-item" v-show="showPencilItem" @click.stop="() => {}">
                                    <div class="color-item">
                                        <span v-for="(item, index) in colorList" :key="index" :style="{backgroundColor: item, borderColor: item}"
                                              @mousedown.stop="() => {strokeColor = item}" :class="{selected: strokeColor === item}"></span>
                                    </div>
                                    <div class="strokeWidth-item">
                                        <span @mousedown.stop="strokeWidth = 11" :class="{selected: strokeWidth === 11}"></span>
                                        <span @mousedown.stop="strokeWidth = 16" :class="{selected: strokeWidth === 16}"></span>
                                        <span @mousedown.stop="strokeWidth = 26" :class="{selected: strokeWidth === 26}"></span>
                                    </div>
                                </div>
                            </div>
                            <div :class="{shape: true, selected: shape === 'SHAPE'}" @mouseenter="showShapeItem = true" @mouseleave="showShapeItem = false"
                                 @click="() => {shape === 'SHAPE'? stopDrawing(): shape = 'SHAPE'; drawingShape = 'rect'; fill = false; drawByShape(); trigger(shape)}">
                                <div class="shape-item" v-show="showShapeItem">
                                    <span :class="{rect: true, selected: drawingShape === 'rect' && !fill && shape === 'SHAPE'}"
                                    @click.stop="() => {shape === 'SHAPE' && drawingShape === 'rect' && !fill? stopDrawing():
                                          shape = 'SHAPE'; drawingShape = 'rect'; fill = false; drawByShape(); trigger(shape)}"></span>
                                    <span :class="{circle: true, selected: drawingShape === 'circle' && !fill && shape === 'SHAPE'}"
                                          @click.stop="() => {shape === 'SHAPE' && drawingShape === 'circle' && !fill? stopDrawing():
                                          shape = 'SHAPE'; drawingShape = 'circle'; fill = false; drawByShape(); trigger(shape)}"></span>
                                    <span class="line"></span>
                                    <span :class="{fillRect: true, selected: drawingShape === 'rect' && fill && shape === 'SHAPE'}"
                                          @click.stop="() => {shape === 'SHAPE' && drawingShape === 'rect' && fill? stopDrawing():
                                          shape = 'SHAPE'; drawingShape = 'rect'; fill = true; drawByShape(); trigger(shape)}"></span>
                                    <span :class="{fillCircle: true, selected: drawingShape === 'circle' && fill && shape === 'SHAPE'}"
                                          @click.stop="() => {shape === 'SHAPE' && drawingShape === 'circle' && fill? stopDrawing():
                                          shape = 'SHAPE'; drawingShape = 'circle'; fill = true; drawByShape(); trigger(shape)}"></span>
                                </div>
                            </div>
                            <div :class="{text: true, selected: shape === 'TEXT'}" @click="() => {shape === 'TEXT'? stopDrawing(): shape = 'TEXT'; drawByShape(); trigger(shape)}"></div>
                            <div class="line"></div>
                            <div class="eraser" @click="eraser"></div>
                            <div class="delete" @click="clearAll"></div>
                            <div class="back" @click="undo"></div>
                        </div>
                        <span class="back" @click="changeImage($event, 0)"></span>
                        <span class="fast-forward" @click="changeImage($event, 2)"></span>
                        <span class="skip" @click="showSkipPictureArea = !showSkipPictureArea"></span>
                        <div class="skip-picture-area" v-show="showSkipPictureArea">
                            <div class="skip-picture-area-box">
                                <img :src="item" alt="" v-for="(item, index) in imageList" :key="index"
                                     @click="changeImage(indexOfImageList = index, 1)">
                            </div>
                        </div>
                    </div>
                    <div class="mode">
                        <button @click="changeModeToAnimate" :class="{active: mode === 'animate'}">动画</button>
                        <button @click="changeModeToPicture" :class="{active: mode === 'picture'}">图片</button>
                    </div>
                </div>
            </div>
            <div class="sketchpad-area" v-if="peerIdList.length > 1 && $store.getters.controlAllStatus">
                <Sketchpad :id="id" :rtcRoom="rtcRoom" :studentVideoScale="1.95"
                           :studentName="studentNameObj[id]" v-for="id in peerIdList" :key="id"></Sketchpad>
                <p class="operateStudentsVideo">
                    <button><img src="./images/cover.png" alt="">取消铺满</button>
                    <button :class="{muteAll: !$store.getters.updateAudioStatus, mute: true}" @click="$store.commit('updateAudioStatusAll')">
                        <img :src="muteSrc" alt="">{{muteText}}
                    </button>
                    <button :class="{controlAll: $store.getters.controlAllStatus, control: true}" @click="$store.commit('updateControlStatusAll')" >
                        <img :src="controlSrc" alt="">{{controlText}}
                    </button>
                </p>
            </div>
        </main>
    </div>
</template>

<script>
    var ImageEditor = require('tui-image-editor');
    import 'tui-image-editor/dist/tui-image-editor.css'
    import icona from 'tui-image-editor/dist/svg/icon-a.svg'
    import iconb from 'tui-image-editor/dist/svg/icon-b.svg'
    import iconc from 'tui-image-editor/dist/svg/icon-c.svg'
    import icond from 'tui-image-editor/dist/svg/icon-d.svg'
    var blackTheme = { // or white
                       // main icons
        'menu.normalIcon.path': icond,
        'menu.activeIcon.path': iconb,
        'menu.disabledIcon.path': icona,
        'menu.hoverIcon.path': iconc,
        'submenu.normalIcon.path': icond,
        'submenu.activeIcon.path': iconb
    };
    import exampleImg from './images/example.jpg'

    // 导入socket
    // const io = require('socket.io-client/dist/socket.io.js')
    import RTCRoom from '@/lib/RTCRoomSDK/RTCRoomManager'

    // 导入直播组件
    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    import Speaker from '@/components/liveBroadcast/Speaker'
    import TeacherVideo from '@/components/liveBroadcast/TeacherVideoForTeacher'
    import StudentVideo from '@/components/liveBroadcast/StudentVideoForTeacher'
    import Sketchpad from '@/components/liveBroadcast/Sketchpad'

    import muteImg from './images/mute.png'
    import cancelMuteImg from './images/cancel_mute.png'
    import controlImg from './images/control.png'
    import cancelControlImg from './images/control-cancel.png'

    export default {
        name: "LiveBroadcast",
        data () {
            return {
                // -----------画板数据---------------
                shape: 'NORMAL',
                imageEditor: null,
                showPencilItem: false, //显示直线类型选项
                showShapeItem: false, //显示形状类型选项
                showStrokeWide: false, //显示线宽选项
                showColorItem: false, //显示颜色选项
                showTextItem: false, //显示文字选项
                drawingShape: '', // 绘制的图形样式
                fill: false, //填充图形
                strokeWidth: 11,  //线宽
                strokeColor: '#2E3E50', //线的颜色
                colorList: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#29b6f6', '#2E3E50'],
                // -----------rtcRoom数据---------------
                rtcRoom: null,
                peerIdList: [], // 学生的id
                studentNameObj: {}, // 每个学生的姓名
                teacherId: '', // 老师id
                teacherName: '',
                // -----------playarea基础数据---------------
                iframeSrc: '',
                disabled: true, // 控制播放器滑块
                mode: 'animate', // 直播模式
                videoMode: false, // video模式是否被开启
                showLoadImage: false, // 显示载入图片区域
                progressBar: 0, // 视频进度条
                loading: false, // 上传图片中
                imageList: [exampleImg], // 图片列表
                indexOfImageList: 0, // 显示图片的索引
                showSkipPictureArea: false, // 显示跳转图片区域
                studentOnStageType: '', // 学生是出于大屏模式还是小屏
                // -----------视频拖拽数据---------------
                dragVideoId: '', // 被拖拽的视频id
                dragVideoIdCache: '', // 被拖拽的视频id暂存
                dragVideoPosition: {x: '22px', y: '22px', offsetX: 0, offsetY: 0, dragStudentVideoScale: 1}, // 拖拽视频位置
                showWrapper: false, // 显示遮挡层
                // -----------基础数据---------------
                mikeStatus: true, // 开启麦克风
                showPicture: true, // 控制视频平铺
                videoAreaWidth: '637px', // 播放区域宽度
                showStudentStatus: true, // student video中的状态栏显示
                studentVideoScale: 1, // 学生区域缩放倍数
            }
        },
        components: {
            NetStatus,
            MikeStatus,
            Speaker,
            TeacherVideo,
            StudentVideo,
            Sketchpad
        },
        created () {
            this.init()
        },
        computed: {
            muteSrc () {
                if (this.$store.getters.updateAudioStatus) {
                    return muteImg
                }else {
                    return cancelMuteImg
                }
            },
            muteText () {
                if (this.$store.getters.updateAudioStatus) {
                    return '全部静音'
                }else {
                    return '取消静音'
                }
            },
            controlSrc () {
                if (!this.$store.getters.controlAllStatus) {
                    return controlImg
                }else {
                    return cancelControlImg
                }
            },
            controlText () {
                if (!this.$store.getters.controlAllStatus) {
                    return '全部操作'
                }else {
                    return '取消操作'
                }
            },
            updateControlStatus () {
                return this.$store.getters.updateControlStatus
            },
            controlAllStatus () {
                return this.$store.getters.controlAllStatus
            }
        },
        mounted () {
            this.paint()
        },
        watch: {
            strokeWidth: function (val) {
                this.imageEditor.stopDrawingMode(); //即时更换线条颜色
                this.drawByShape();
                const params = {
                    type: 'setStrokeWidth',
                    strokeWidth: val
                }
                this.sendDrawData(params)
            },
            strokeColor: function (val) {
                this.imageEditor.stopDrawingMode(); //即时更换线条颜色
                this.drawByShape();
                const params = {
                    type: 'setStrokeColor',
                    strokeColor: val
                }
                this.sendDrawData(params)
            },
            fill: function (val) {
                this.imageEditor.stopDrawingMode(); //即时更换线条颜色
                this.drawByShape();
                const params = {
                    type: 'setFill',
                    fill: val
                }
                this.sendDrawData(params)
            },
            mode: function (val) {
                if (val !== 'video') {
                    const video = this.$refs['video-play']
                    const play = this.$refs['play']
                    play.classList.remove('pause')
                    video.pause();
                }
            },
            updateControlStatus: function (val) {
                if (val.length === 1) { // 当只有一个学生授权操作，总学生数大于1时，该学生上台
                    const studentId = val[0]
                    this.cancelPictureCovered()
                    if (this.dragVideoId && this.dragVideoId !== val[0]) { // 学生数为2时，全部操作后，取消一个学生操作
                        this.dragVideoIdCache = this.dragVideoId
                        this.removeDragStudentVideo()
                    }
                    if (this.dragVideoId && this.dragVideoId === val[0]) { // 学生数为2时，全部操作后，取消一个学生操作，还原学生界面状态
                        const studentOnStageType = this.studentOnStageType
                        const id = this.dragVideoId
                        if (studentOnStageType === 'small') {
                            this.sendStageStatus('onStage-small', id)
                        }else if (studentOnStageType === 'big') {
                            this.sendStageStatus('onStage-big', id)
                        }
                    }
                    if (this.dragVideoId) return // 防止与拖拽操作重复
                    this.$nextTick(function () {
                        this.onStage(studentId)
                    })
                }
                if (!val) { // 取消上台
                    this.removeDragStudentVideo()
                }
            },
            controlAllStatus: function (val) { // 全部操作时，取消铺满
                if (val && this.peerIdList.length > 0) {
                    this.cancelPictureCovered()
                    if (this.dragVideoId && this.peerIdList.length > 1) {
                        this.sendOutStageStatus(this.dragVideoId) // 全部操作时，通知学生下台
                    }
                }
                if (val && this.peerIdList.length > 1) { // 全部操作时，通知学生发送初始化数据到画板
                    const params = {
                        type: 'init'
                    }
                    this.rtcRoom.sendMessage(params)
                }
            }
        },
        methods: {
            // 初始化
            init () {
                // 载入本地存储
                this.$store.commit('readLiveBroadcastDataFromLocalStorage')

                // 初始化rtcROOM
                this.initRtcRoom()
            },

            // 初始化rtcROOM
            initRtcRoom() {
                const rtcRoom = new RTCRoom()
                const host = 'www2.9man.com'
                const port = 3210
                const roomId = '8888'
                const teacherPeerId = '1'
                const userParams = {name: '小明'}
                rtcRoom.joinRoom(host,port,roomId,teacherPeerId,userParams)
                this.teacherId = teacherPeerId
                this.teacherName = userParams.name
                // 设置iframeSrc
                this.iframeSrc = ` https://www2.9man.com/syncshuxe/start.html?path=3-1&roomId=${roomId}&peerId=${teacherPeerId}&manager=1`

                // this.peerIdList = ['1', '2']

                // 用户加入时更新peerIdList
                rtcRoom.on('user-joined',(id) => {
                    console.log('用户进入：' + id)
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

                    // 处理静音状态
                    const userAudioStatus = this.$store.state.liveBroadcast.liveBroadcastData.audioStatus[id]
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
                    const userControlStatus = this.$store.state.liveBroadcast.liveBroadcastData.controlStatus[id]
                    const params = {
                        type: 'controlStudentOperate',
                    }
                    if (userControlStatus) {
                        Object.assign(params, {status: userControlStatus})
                        if (userControlStatus === 1) {
                            rtcRoom.notifyMessage(params, id)
                        } else if (userControlStatus === 2) {
                            rtcRoom.notifyMessage(params, id)
                        }
                    } else {
                        Object.assign(params, {status: 2})
                        rtcRoom.notifyMessage(params, id)
                        this.$store.commit('setControlStatus', {id: id, status: 2})
                    }
                });

                // 学生页面加载完成后，发送同步数据
                rtcRoom.on('message-notify-receive', (peerId, data) => {
                    if (data.type === 'pageDone') {
                        this.synchronize(peerId) // 同步状态
                    }
                })

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
                this.rtcRoom = rtcRoom
                this.$store.commit('setRtcRoom', rtcRoom)
            },

            // 离开房间
            leaveRoom () {
                const rtcRoom = this.rtcRoom
                this.$confirm({
                    title: '确定要退出房间吗?',
                    content: '',
                    centered: true,
                    onOk() {
                        rtcRoom.leaveRoom();
                    },
                    onCancel() {},
                });
            },

            // 当学生连接时同步状态
            synchronize(userId) {
                const params = {
                    type: 'synchronize',
                    values: {
                        strokeWidth: this.strokeWidth,
                        strokeColor: this.strokeColor,
                        fill: this.fill,
                        mode: this.mode,
                        showPicture: !this.showPicture,
                        shape: this.shape,
                        drawingShape: this.drawingShape
                    }
                }
                this.rtcRoom.notifyMessage(params, userId)
                const studentOnStageType = this.studentOnStageType
                const id = this.dragVideoId
                if (studentOnStageType === 'small') {
                    this.sendStageStatus('onStage-small', id)
                }else if (studentOnStageType === 'big') {
                    this.sendStageStatus('onStage-big', id)
                }
            },

            // 画图
            paint () {
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
                    cssMaxWidth: 1152,
                    cssMaxHeight: 710,
                    selectionStyle: {
                        cornerSize: 20,
                        rotatingPointOffset: 70
                    }
                });
                this.imageEditor = instance;
                const _this = this;
                const canvas = document.querySelector('#tui-image-editor');

                // 编辑文字事件
                instance.on('textEditing', function() {
                    const objectId = instance.activeObjectId;
                    document.onkeyup = function () {
                        if (instance.activeObjectId) {
                            const text = instance._graphics._objects[objectId].text;
                            const params = {
                                type: 'editingText',
                                text,
                                id: objectId
                            };
                            _this.sendDrawData(params);

                        }
                    }
                    canvas.onmousedown = function () {
                        if (!instance.activeObjectId) {
                            document.onkeyup = null;
                            canvas.onmousedown = null;
                        }
                    }
                });
                //鼠标点击事件
                instance.on('mousedown', function(event, originPointer) {
                    const shape = _this.shape;
                    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                    const e = {
                        screenX: event.screenX,
                        screenY: event.screenY,
                        clientX: event.clientX + scrollLeft,
                        clientY: event.clientY + scrollTop,
                    }
                    const params = {
                        type: 'mousedown',
                        e
                    }
                    _this.drawByShape();
                    _this.sendDrawData(params)

                    //鼠标移动事件
                    canvas.onmousemove = function (event) {
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.clientX + scrollLeft,
                            clientY: event.clientY + scrollTop,
                        }
                        const params = {
                            type: 'mousemove',
                            e
                        }
                        _this.sendDrawData(params)
                    };
                    //鼠标抬起事件
                    document.addEventListener('mouseup', function (event) {
                        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.clientX + scrollLeft,
                            clientY: event.clientY + scrollTop,
                        }
                        const params = {
                            type: 'mouseup',
                            e
                        }
                        _this.sendDrawData(params)
                        instance.stopDrawingMode(); //即时更换线条颜色
                        _this.drawByShape();
                        canvas.onmousemove = null;
                        document.onmouseup = null;
                    }, false)
                });
            },

            //根据shape绘制图形
            drawByShape () {
                const shape = this.shape;
                if (shape === 'LINE_DRAWING') {
                     this.drawLine()
                }else if (shape === 'FREE_DRAWING') {
                     this.drawCurve()
                }else if (shape === 'SHAPE') {
                     this.drawShape()
                }else if (shape === 'TEXT') {
                     this.addText()
                }
            },

            //画直线
            drawLine () {
                const imageEditor = this.imageEditor;
                imageEditor.startDrawingMode('LINE_DRAWING',{
                    width: this.strokeWidth,
                    color: this.strokeColor
                });
            },

            //画曲线
            drawCurve () {
                const imageEditor = this.imageEditor;
                imageEditor.startDrawingMode('FREE_DRAWING', {
                    width: this.strokeWidth,
                    color: this.strokeColor
                });
            },

            //画矩形
            drawShape () {
                const imageEditor = this.imageEditor;
                imageEditor.setDrawingShape(this.drawingShape, {
                    fill: this.fill? this.strokeColor: 'transparent',
                    stroke: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                });
                imageEditor.startDrawingMode('SHAPE');
            },

            //添加文字
            addText () {
                const imageEditor = this.imageEditor;
                imageEditor.ui.text.fontSize = this.strokeWidth * 2;
                imageEditor.ui.text._els.textColorpicker.color = this.strokeColor;
                imageEditor.startDrawingMode('TEXT');

            },

            //橡皮擦功能
            eraser () {
                const imageEditor = this.imageEditor;
                const objectId = imageEditor.activeObjectId;
                if (this.shape !== 'NORMAL') {
                    this.stopDrawing();
                }
                imageEditor.removeActiveObject();

                // 发送删除图形请求
                const params = {
                    type: 'ERASER',
                    id: objectId
                };
                this.sendDrawData(params);
            },

            //停止绘画
            stopDrawing () {
                const imageEditor = this.imageEditor;
                imageEditor.stopDrawingMode();
                this.shape = 'NORMAL';
                imageEditor.changeCursor('default');
                const params = {
                    type: 'stopDrawing'
                }
                this.sendDrawData(params)
            },

            //清除所有
            clearAll () {
                const imageEditor = this.imageEditor;
                imageEditor.clearObjects();

                // 发送清除图形请求
                const params = {
                    type: 'CLEARALL'
                };
                this.sendDrawData(params);
            },

            //返回上一步
            undo () {
                const imageEditor = this.imageEditor;
                imageEditor.undo().catch(() => {});

                // 发送撤销请求
                const params = {
                    type: 'UNDO'
                };
                this.sendDrawData(params);
            },

            // 触发不同的画图操作
            trigger (type) {
                const params = {
                    type,
                }
                if (type === 'SHAPE') {
                    Object.assign(params, {drawingShape: this.drawingShape})
                }
                this.sendDrawData(params)
            },

            //发送画图数据
            sendDrawData (params) {
                Object.assign(params, {id: this.teacherId})
                this.rtcRoom.sendMessage(params)
            },

            // 开始视频拖拽
            startDragVideo(params) {
                this.showWrapper = true
                this.dragVideoIdCache = params.id
                this.dragVideoPosition.offsetX = params.x
                this.dragVideoPosition.offsetY = params.y
            },

            // 拖拽结束
            endDragVideo() {
                this.showWrapper = false
            },

            // 视频被拖拽进入
            videoDropIn(e) {
                if (e.id && e.id !== this.dragVideoId) return

                // 被拖拽的元素
                const target = document.querySelector('#' + e.dataTransfer.getData('text/html'))
                const targetStyle = target.style
                const targetHeight = target.offsetHeight

                let editArea = null
                if (this.mode === 'picture') {
                    editArea = this.$refs.editArea
                }else if (this.mode === 'animate') {
                    editArea = this.$refs.animateArea
                }else if (this.mode === 'video') {
                    editArea = this.$refs['video-area']
                }

                const editAreaWidth = editArea.offsetWidth
                const editAreaHeight = editArea.offsetHeight
                const playArea = this.$refs.playArea
                const scrollLeft = window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0
                const scrollTop = window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0
                const [playAreaOffsetLeft, playAreaOffsetTop] = [playArea.offsetLeft - scrollLeft, playArea.offsetTop - scrollTop]
                this.dragVideoId = this.dragVideoIdCache
                const offsetX = e.clientX - playAreaOffsetLeft
                const offsetY = e.clientY - playAreaOffsetTop

                if (offsetX > editAreaWidth / 2 &&  offsetY > editAreaHeight / 2) {
                    this.studentOnStageType = 'big'
                    if (targetHeight !== 710) {
                        this.dragVideoPosition.x = offsetX - this.dragVideoPosition.offsetX * 2.62 + playArea.offsetLeft + 22 + 'px' // 2.62为放大倍数
                        this.dragVideoPosition.y = offsetY - this.dragVideoPosition.offsetY * 2.62 + playArea.offsetTop + 22 + 'px'
                    }else {
                        this.dragVideoPosition.x = offsetX - this.dragVideoPosition.offsetX + playArea.offsetLeft + 22 + 'px'
                        this.dragVideoPosition.y = offsetY - this.dragVideoPosition.offsetY + playArea.offsetTop + 22 + 'px'
                    }
                }else {
                    this.studentOnStageType = 'small'
                    if (targetHeight === 710) {
                        this.dragVideoPosition.x = offsetX - this.dragVideoPosition.offsetX / 2.62 + playArea.offsetLeft + 22 + 'px' // 2.62为放大倍数
                        this.dragVideoPosition.y = offsetY - this.dragVideoPosition.offsetY / 2.62 + playArea.offsetTop + 22 + 'px'
                    }else {
                        this.dragVideoPosition.x = offsetX - this.dragVideoPosition.offsetX + playArea.offsetLeft + 22 + 'px'
                        this.dragVideoPosition.y = offsetY - this.dragVideoPosition.offsetY + playArea.offsetTop + 22 + 'px'
                    }
                }

                // 开启操作权限
                const params = {
                    type: 'controlStudentOperate',
                    status: 1
                }
                this.$store.commit('setControlStatus', {id: this.dragVideoIdCache, status: 1})
                this.rtcRoom.sendMessage(params, this.dragVideoIdCache)

                const id = this.dragVideoId

                if (target.classList.contains('small-video') || target.classList.contains('big-video')) {
                    target.classList.remove('small-video', 'big-video')
                    setTimeout(() => {
                        targetStyle.top = this.dragVideoPosition.y
                        targetStyle.left = this.dragVideoPosition.x
                        if (offsetX > editAreaWidth / 2 &&  offsetY > editAreaHeight / 2) {
                            target.classList.remove('small-video')
                            target.classList.add('big-video')
                            this.sendStageStatus('onStage-big', id)
                        }else {
                            target.classList.remove('big-video')
                            target.classList.add('small-video')
                            this.sendStageStatus('onStage-small', id)
                        }
                    }, 1)

                }else {
                    targetStyle.top = this.dragVideoPosition.y
                    targetStyle.left = this.dragVideoPosition.x
                    if (offsetX > editAreaWidth / 2 &&  offsetY > editAreaHeight / 2) {
                        target.classList.remove('small-video')
                        target.classList.add('big-video')
                        this.sendStageStatus('onStage-big', id)
                    }else {
                        target.classList.remove('big-video')
                        target.classList.add('small-video')
                        this.sendStageStatus('onStage-small', id)
                    }
                }
            },

            // 学生上台
            onStage(id) {
                this.dragVideoId = id
                this.dragVideoIdCache = id
                this.studentOnStageType = 'small'
                const playArea = this.$refs.playArea
                const target = document.querySelector('#video' + id)
                const targetStyle = target.style
                targetStyle.top = 22 + playArea.offsetTop + 'px'
                targetStyle.left = 22 + playArea.offsetLeft + 'px'
                target.classList.add('small-video')
                this.sendStageStatus('onStage-small', id)
            },

            // 学生上台后发送socket状态
            sendStageStatus(type, id) {
                const params = {
                    type,
                    id,
                    name: this.studentNameObj[id]
                }
                this.rtcRoom.sendMessage(params)
            },

            // 学生下台后发送socket状态
            sendOutStageStatus(id) {
                const params = {
                    type: 'outStage',
                    id
                }
                this.rtcRoom.sendMessage(params)
            },

            // 移除拖拽的视频
            removeDragStudentVideo(e) {
                if (this.dragVideoIdCache === this.dragVideoId) {
                    this.studentOnStageType = ''
                    const target = document.querySelector('#video' + this.dragVideoId)
                    const targetStyle = target.style
                    targetStyle.top = 0
                    targetStyle.left = 0
                    // 关闭操作权限
                    const params = {
                        type: 'controlStudentOperate',
                        status: 2
                    }
                    this.$store.commit('setControlStatus', {id: this.dragVideoIdCache, status: 2})
                    this.rtcRoom.sendMessage(params, this.dragVideoIdCache)
                    target.classList.remove('small-video', 'big-video')
                    this.sendOutStageStatus(this.dragVideoId)
                    this.dragVideoId = ''
                }
            },

            // 初始化iframe
            initIframe() {
                // const iframe = this.$refs.iframe
                // console.log(iframe);
                // const _this = this
                // iframe.onload = function () {
                //     const body = this.contentWindow.document.body
                    // body.ondragover = function (e) {
                    //     // e.preventDefault()
                    // }
                    // body.ondrop = function (e) {
                    //     _this.$refs.playArea.drop()
                    // }
                // }
            },

            // 画面铺满
            pictureCovered() {
                if (this.peerIdList.length === 0) return
                this.showPicture = false
                this.showStudentStatus = false
                if (this.dragVideoId) { // 还原拖拽的视频
                    this.dragVideoIdCache = this.dragVideoId
                    this.removeDragStudentVideo()
                }
                const main = this.$refs.main
                const mainWidth = main.offsetWidth
                this.videoAreaWidth = '100%'
                this.studentVideoScale = (mainWidth - 120) / 3 / 308
                const params = {
                    type: 'pictureCovered',
                };
                this.sendDrawData(params);
            },

            // 取消画面铺满
            cancelPictureCovered() {
                this.showPicture = true
                this.showStudentStatus = true
                this.videoAreaWidth = '637px'
                this.studentVideoScale = 1
                const params = {
                    type: 'cancelPictureCovered'
                };
                this.sendDrawData(params);
            },

            // 处理上传图片请求
            beforeUploadImage (file) {
                const type = file.type
                const size = file.size

                if (type.substr(0, 5) === 'video') {
                    const reader = new FileReader();
                    this.mode = 'video'
                    this.videoMode = true
                    this.$nextTick(function () {
                        const video = this.$refs['video-play']
                        reader.onload = () => {
                            this.showLoadImage = false
                            const blob = new Blob([reader.result]);
                            video.src = window.URL.createObjectURL(blob);
                        };
                        reader.readAsArrayBuffer(file);
                    })

                }else if (type.substr(0, 5) === 'image') {
                    if (size / 1024 / 1024 > 2) {
                        this.$message.error('图片大小不能超过2MB!')
                        return false
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        this.imageList.push(reader.result)
                        this.changeImage(this.$event, 1)
                        this.mode = 'picture'
                        this.showLoadImage = false
                    };
                    reader.readAsDataURL(file);

                }else {
                    this.$message.error('文件格式不正确!')
                }
                return false
            },

            // 视频播放功能
            videoPlay () {
                if (this.mode !== 'video') return
                const video = this.$refs['video-play']
                const play = this.$refs['play']
                play.classList.toggle('pause')
                if (video.paused) {
                    video.play();
                }else {
                    video.pause();
                }
            },

            // 显示视频播放进度
            videoTimeupdate (e) {
                const video = e.target
                const currentTime = video.currentTime
                //计算进度条百分比
                this.progressBar = parseInt(currentTime / video.duration * 100)
            },

            // 改变视频播放进度
            changeVideoProgress (value) {
                const video = this.$refs['video-play']
                video.currentTime = value / 100 * video.duration
            },

            // 视频播放结束
            videoEnded (e) {
                const video = e.target
                const play = this.$refs['play']
                play.classList.remove('pause')
                video.currentTime = 0
            },

            // 变为动画模式
            changeModeToAnimate () {
                this.mode = 'animate'
                this.disabled = true
                const params = {
                    type: 'changeMode',
                    mode: 'animate'
                };
                this.sendDrawData(params);
            },

            // 变为图片模式
            changeModeToPicture () {
                if (this.videoMode) {
                    this.mode = 'video'
                }else {
                    this.mode = 'picture'
                    const params = {
                        type: 'changeMode',
                        mode: 'picture'
                    };
                    this.sendDrawData(params);
                }

                this.disabled = false
            },

            // 切换图片
            changeImage (e, direction) {
                if (this.mode === 'video') {
                    this.showLoadImage = true
                    this.mode = 'picture'
                    return
                }
                if (this.mode === 'picture') {
                    if (direction === 0) { // 0时后退，1时不变，2时前进
                        this.indexOfImageList --
                    } else if (direction === 1) {

                    } else if (direction === 2) {
                        if (this.showLoadImage) return
                        this.indexOfImageList ++
                    }

                    const indexOfImageList = this.indexOfImageList
                    const imageList = this.imageList

                    if (indexOfImageList < 0) { // indexOfImageList不能小于0
                        return  this.indexOfImageList = 0
                    }

                    if (imageList[indexOfImageList]) { // 存在则切换图片
                        this.imageEditor.loadImageFromURL(imageList[indexOfImageList], 'image').then(() => {
                            this.showLoadImage = false
                        }).catch(err => {
                            console.log(err);});
                    }else {
                        this.showLoadImage = true
                    }
                }
            },

        }
    }
</script>

<style lang="less">
    @media screen and (max-width: 1700px) {
        .LiveBroadcast-container {
           .select-bar {
               .action {
                   .action-item {
                       padding: 0 20px !important;
                   }
                   .start-class {
                       margin-left: 20px !important;
                   }
               }
           }
        }
    }
    @media screen and (max-width: 1600px) {
        .LiveBroadcast-container {
            .select-bar {
                .draw-operate {
                    > div {
                        margin-right: 10px !important;
                    }
                    .line {
                        margin: 15px 10px !important;
                    }
                }
            }
        }
    }
    @media screen and (max-width: 1450px) {
        .LiveBroadcast-container {
            .select-bar {
                .draw-operate {
                    > div {
                        margin-right: 5px !important;
                    }
                    .line {
                        margin: 15px 5px !important;
                    }
                }
                .action {
                    .action-item {
                        padding: 0 10px !important;
                    }
                    .start-class {
                        margin-left: 10px !important;
                    }
                }
            }
        }
    }

    .LiveBroadcast-container {
        width: 100%;
        min-width: 1920px;
        background:linear-gradient(0deg,rgba(242,153,74,1),rgba(242,201,76,1));
        background-size: cover;
        .statusBar {
            height: 64px;
            background-color: #fff;
            padding: 0 30px;
            font-size: 19px;
            color: #FF6A04;
            display: flex;
            justify-content: space-between;
            .deviceInfo {
                width: 29%;
                min-width: 360px;
                height: 100%;
                display: flex;
                justify-content: space-between;
                > div {
                    display: flex;
                    align-items: center;
                    > span {
                        margin-right: 13px;
                    }
                }
            }
            .className {
                height: 100%;
                line-height: 64px;
            }
            .startClass {
                line-height: 64px;
                min-width: 235px;
                button {
                    width: 140px;
                    height: 40px;
                    background-image: url("./images/button.png");
                    border: 0;
                    color: #fff;
                    font-size: 18px;
                    box-shadow: unset;
                    border-radius: 30px;
                }
                .time {
                    font-size: 19px;
                    margin-right: 20px;
                }
                img {
                    margin-left: 30px;
                    cursor: pointer;
                    margin-bottom: 17px;
                }
            }
        }
        main {
            padding: 30px;
            .playArea {
                float: right;
                width: 1194px;
                height: 916px;
                padding: 22px;
                background-color: rgba(255,203,167,1);
                border-radius:20px;
                position: relative;
                .wrapper {
                    position: absolute;
                    width: 1152px;
                    height: 710px;
                    left: 22px;
                    top: 22px;
                    opacity: 0;
                    z-index: 99;
                }
                .load-image {
                    position: absolute;
                    left: 22px;
                    top: 22px;
                    width: 1152px;
                    height: 710px;
                    background-color: #fff;
                    border-radius:20px;
                    z-index: 9;
                    .avatar-uploader {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        .ant-upload-select-picture-card {
                            border: 2px dashed #d9d9d9;
                            width: 250px;
                            height: 250px;
                            &:hover {
                                border-color: #FF6A04;
                                i {
                                    color: #FF6A04;
                                }
                            }
                            i {
                                font-size: 130px;
                                color: #999;
                                transition: color 0.3s ease;
                            }
                            .ant-upload-text {
                                color: #666;
                                font-size: 30px;
                                position: absolute;
                                top: 270px;
                                width: 236px;
                            }
                        }
                    }
                }
                > .video-area {
                    width: 100%;
                    height: 710px;
                    border-radius:20px;
                    background-color: #000;
                    video {
                        width: 100%;
                        height: 100%;
                    }
                }

                .animate-area {
                    width: 100%;
                    height: 710px;
                    border-radius:20px;
                    overflow: hidden;
                    position: relative;
                    iframe {
                        width: 100%;
                        height: 100%;
                    }
                }
                #tui-image-editor {
                    width: 1152px !important;
                    height: 710px !important;
                    border-radius:20px;
                    overflow: hidden;
                    .tui-image-editor-main-container {
                        width: 1152px;
                        height: 710px;
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
                .operate {
                    height: 55px;
                    margin-top: 28px;
                    .mode-animate {
                        display: flex;
                        justify-content: space-between;
                        .ant-slider {
                            width: 772px;
                            &:hover .ant-slider-rail {
                                background-color: #fff;
                            }
                            .ant-slider-rail {
                                height: 20px;
                                border-radius: 20px;
                                background-color: #fff;
                            }
                            .ant-slider-track {
                                height: 20px;
                                border-radius: 10px 0 0 10px;
                                background-color: #FF6A04;
                            }
                            .ant-slider-handle {
                                height: 36px;
                                width: 36px;
                                border: 4px solid #FF6A04;
                                box-shadow: unset;
                            }
                        }
                        > span {
                            height: 55px;
                            width: 55px;
                            display: inline-block;
                            cursor: pointer;
                        }
                        .play {
                            background-image: url("images/play.png");
                            background-position: center;
                            &.pause {
                                background-image: url("images/pause.png");
                                background-position: -1px 0;
                            }
                            &.disable {
                                background-image: url("images/play_disable.png");

                            }
                        }
                        .back {
                            background-image: url("images/goback.png");
                        }
                        .fast-forward {
                            background-image: url("images/fast-forward.png");
                        }
                        .skip {
                            background-image: url("images/skip.png");
                        }
                    }
                    .mode-picture {
                        display: flex;
                        justify-content: space-between;
                        position: relative;
                        > span {
                            height: 55px;
                            width: 55px;
                            display: inline-block;
                            cursor: pointer;
                        }
                        .back {
                            background-image: url("images/goback.png");
                        }
                        .fast-forward {
                            background-image: url("images/fast-forward.png");
                        }
                        .skip {
                            background-image: url("images/skip.png");
                        }
                        .skip-picture-area {
                            position: absolute;
                            padding: 14px;
                            right: -2px;
                            bottom: 87px;
                            width:515px;
                            height:324px;
                            background:rgba(249,254,240,.9);
                            border-radius:20px;
                            display: flex;
                            justify-content: flex-start;
                            flex-wrap: wrap;
                            align-items: flex-start;
                            z-index: 999;
                            .skip-picture-area-box {
                                width: 100%;
                                height: 100%;
                                overflow: auto;
                                img {
                                    width:146px;
                                    height:91px;
                                    border-radius:20px;
                                    margin-bottom: 12px;
                                    margin-right: 12px;
                                    cursor: pointer;
                                }
                                &::-webkit-scrollbar {
                                    width: 10px;
                                }
                                &::-webkit-scrollbar-track {
                                    border-radius: 5px;
                                    background-color: #fff;
                                } /* 滚动条的滑轨背景颜色 */

                                &::-webkit-scrollbar-thumb {
                                    border-radius: 5px;
                                    background-color: #D2D2D2;
                                } /* 滑块颜色 */

                                &::-webkit-scrollbar-button {
                                    height: 0;
                                } /* 滑轨两头的监听按钮颜色 */

                                &::-webkit-scrollbar-corner {
                                    height: 0;
                                }
                            }

                        }
                        .draw-operate {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background-color: #fff;
                            width:876px;
                            height:64px;
                            border-radius:20px;
                            padding: 0 44px;
                            margin-top: -5px;
                            > div {
                                display: inline-block;
                                width: 43px;
                                height: 43px;
                                background-position: center;
                                background-repeat: no-repeat;
                                background-size: cover;
                                cursor: pointer;
                                transition: all .2s;
                                position: relative;
                                > div {
                                    height:34px;
                                    border-radius:10px 10px 0 0;
                                    background-color: #fff;
                                    position: absolute;
                                    left: 0;
                                    top: -78px;
                                    padding: 6px 10px;
                                    display: flex;
                                    justify-content: space-between;
                                    z-index: 999;
                                    span {
                                        display: inline-block;
                                        width: 22px;
                                        height: 22px;
                                        transition: border-color .2s cubic-bezier(.645,.045,.355,1);
                                    }
                                }
                            }
                            .pencil {
                                background-image: url("./images/pencil.png");
                                &:hover {
                                    background-image: url("./images/pencil-selected.png");
                                }
                                &.selected {
                                    background-image: url("./images/pencil-selected.png");
                                }
                                .pencil-item {
                                    width:214px;
                                    height: 78px;
                                    flex-wrap: wrap;
                                    .color-item {
                                        width: 100%;
                                        height: 24px;
                                        bottom: -78px;
                                        flex-wrap: wrap;
                                        span {
                                            width: 24px;
                                            height: 24px;
                                            border-radius: 4px;
                                            &:first-of-type ~ span{
                                                margin-left: 10px;
                                            }
                                            &:hover {
                                                border: 2px solid #FF6A04 !important;
                                            }
                                            &.selected {
                                                border: 2px solid #FF6A04 !important;
                                            }
                                        }
                                    }
                                    .strokeWidth-item {
                                        height: 26px;
                                        display: flex;
                                        align-items: center;
                                        > span {
                                            background-color: #5B5B5B;
                                            border-radius: 50%;
                                            display: inline-block;
                                            &:hover {
                                                border: 2px solid #FF6A04 !important;
                                            }
                                            &.selected {
                                                border: 2px solid #FF6A04 !important;
                                            }
                                            &:first-of-type {
                                                width: 11px;
                                                height: 11px;
                                                margin: 0 20px 0 7px;
                                            }
                                            &:nth-of-type(2) {
                                                width: 16px;
                                                height: 16px;
                                            }
                                            &:nth-of-type(3) {
                                                width: 26px;
                                                height: 26px;
                                                margin-left: 13px;
                                            }
                                        }
                                    }
                                }
                            }
                            .shape {
                                background-image: url("./images/shape.png");
                                &:hover {
                                    background-image: url("./images/shape-selected.png");
                                }
                                &.selected {
                                    background-image: url("./images/shape-selected.png");
                                }
                                .shape-item {
                                    width:182px;
                                    top: -34px;
                                    span {
                                        border: 2px solid #FFCBA7;
                                        &:hover {
                                            border-color: #FF6A04;
                                        }
                                        &.selected {
                                            border-color: #FF6A04;
                                        }
                                    }
                                    .circle {
                                        border-radius: 50%;
                                    }
                                    .line {
                                        height: 20px;
                                        background-color: #E6E6E6;
                                        margin: 0 !important;
                                        border: 0;
                                    }
                                    .fillRect, .fillCircle {
                                        background-color: #FFCBA7;
                                    }
                                    .fillCircle {
                                        border-radius: 50%;
                                    }
                                }
                            }
                            .wide {
                                background-image: url("./images/wide.png");
                                &:hover {
                                    background-image: url("./images/wide-selected.png");
                                }
                            }
                            .color {
                                background-image: url("./images/color.png");
                                &:hover {
                                    background-image: url("./images/color-selected.png");
                                }
                            }
                            .text {
                                background-image: url("./images/text.png");
                                margin-right: 0;
                                &:hover {
                                    background-image: url("./images/text-selected.png");
                                }
                                &.selected {
                                    background-image: url("./images/text-selected.png");
                                }
                            }
                            .eraser {
                                background-image: url("./images/eraser.png");
                                &:hover {
                                    background-image: url("./images/eraser-selected.png");
                                }
                            }
                            .delete {
                                background-image: url("./images/delete.png");
                                &:hover {
                                    background-image: url("./images/delete-selected.png");
                                }
                            }
                            .back {
                                background-image: url("./images/back.png");
                                margin-right: 0;
                                &:hover {
                                    background-image: url("./images/back-selected.png");
                                }
                            }
                            .line {
                                width:2px;
                                height:20px;
                                background-color:#e6e6e6;
                                margin: 15px 25px;
                            }
                        }
                    }
                    .mode {
                        margin-top: 26px;
                        text-align: center;
                        button {
                            width:170px;
                            height:56px;
                            background-color:#fff;
                            background-image: none;
                            border-radius:10px;
                            font-size: 18px;
                            color: #FF6700;
                            border: 0;
                            cursor: pointer;
                            outline: unset;
                            &.active {
                                background-image:url("images/button-bcg.png");
                                color: #fff;
                            }
                            & + button {
                                margin-left: 30px;
                            }
                        }
                    }
                }
            }
            .videoArea {
                float: left;
                height: 100%;
                margin-right: 10px;
                .video-teacher {
                    width: 100%;
                    height: 202px;
                    margin-bottom: 28px;
                }
                .video-students {
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    .title {
                        font-size:21px;
                        width: 100%;
                        color: #fff;
                    }
                    > div {
                        margin-bottom: 22px;
                    }
                    .operateStudentsVideo {
                        width: 100%;
                        text-align: center;
                        margin-top: 16px;
                        button {
                            width:150px;
                            height:48px;
                            background-image:url("images/button-bgc.png");
                            border-radius:10px;
                            font-size: 21px;
                            color: #fff;
                            border: 0;
                            cursor: pointer;
                            outline: unset;
                            &.mute {
                                &.muteAll {
                                    background: #fff;
                                    color: #FF6A04;
                                }
                            }
                            &.control {
                                &.controlAll {
                                    background: #fff;
                                    color: #FF6A04;
                                }
                            }
                            img {
                                width: 21px;
                                height: 21px;
                                margin-right: 10px;
                            }
                            &:nth-of-type(2) {
                                margin: 0 100px;
                            }
                        }
                    }
                }
            }
            .sketchpad-area {
                width: 100%;
                height: 100%;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                .title {
                    font-size:21px;
                    width: 100%;
                    color: #fff;
                }
                > div {
                    margin-bottom: 22px;
                }
                .operateStudentsVideo {
                    width: 100%;
                    text-align: center;
                    margin-top: 16px;
                    button {
                        width:150px;
                        height:48px;
                        background-image:url("images/button-bgc.png");
                        border-radius:10px;
                        font-size: 21px;
                        color: #fff;
                        border: 0;
                        cursor: pointer;
                        outline: unset;
                        &.mute {
                            &.muteAll {
                                background: #fff;
                                color: #FF6A04;
                            }
                        }
                        &.control {
                            &.controlAll {
                                background: #fff;
                                color: #FF6A04;
                            }
                        }
                        img {
                            width: 21px;
                            height: 21px;
                            margin-right: 10px;
                        }
                        &:nth-of-type(2) {
                            margin: 0 100px;
                        }
                    }
                }
            }
        }
    }
</style>
