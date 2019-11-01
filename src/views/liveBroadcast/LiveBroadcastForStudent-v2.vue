<template>
    <div class="liveBroadcast-student-container">
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
            <div class="videoArea">
                <div class="video-teacher">
                    <TeacherVideo :rtcRoom="rtcRoom" :teacherName="teacherName" :teacherId="teacherId" v-show="!studentOnStage"></TeacherVideo>
                    <div class="student-on-stage-box" v-show="otherStudentOnStage">
                        <StudentVideo :id="id" mode="others" :rtcRoom="rtcRoom" :studentName="studentNameObj[id]" v-show="id === studentOnStageId"
                                      :studentVideoScale="studentVideoScale" v-for="id in peerIdList" :key="id"></StudentVideo>
                    </div>
                </div>
                <div class="video-students">
                    <StudentVideo :id="studentId" :studentVideoScale="studentVideoScale" :studentName="studentName" mode="self" :showPicture="showPicture"
                                  :showStudentStatus="true"></StudentVideo>
                </div>
            </div>
            <div class="playArea" ref="playArea">
                <div id="tui-image-editor" ref="editArea" v-show="mode === 'picture'"></div>
                <div class="wrapper" v-show="!controlStudentOperate"></div>
                <div class="animate-area" v-show="mode === 'animate'" ref="animateArea">
                    <iframe :src="iframeSrc" ref="iframe"></iframe>
                </div>
                <div class="video-area" v-show="mode === 'video'" ref="video-area">
                    <video src="" ref="video-play" preload="auto" poster="./images/loading.gif" @ended="videoEnded"></video>
                </div>
                <transition name="fade-picture">
                    <div class="picture-covered-container" v-show="showPicture">
                        <div class="picture-covered" :style="{width: pictureCoveredWidth + 'px'}">
                            <div class="picture-covered-box">
                                <StudentVideo :id="studentId" mode="self" :rtcRoom="rtcRoom" :studentName="studentName"
                                              :studentVideoScale="1.17" :showStudentStatus="hideStudentStatus"></StudentVideo>
                            </div>
                            <div class="picture-covered-box" v-for="id in peerIdList" :key="id">
                                <StudentVideo :id="id" mode="others" :rtcRoom="rtcRoom" :studentName="studentNameObj[id]"
                                              :studentVideoScale="1.17" :showStudentStatus="hideStudentStatus"></StudentVideo>
                            </div>
                        </div>
                    </div>
                </transition>
                <div class="operate">
                    <div class="mode-picture">
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
                    </div>
                    <div class="student-list">
                        <StudentInfo v-for="id in peerIdList" :studentName="studentNameObj[id]" :id="id" :key="id"
                                     :studentOnStageId="studentOnStageId"></StudentInfo>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
    const ImageEditor = require('tui-image-editor');
    import 'tui-image-editor/dist/tui-image-editor.min.css'
    import icona from 'tui-image-editor/dist/svg/icon-a.svg'
    import iconb from 'tui-image-editor/dist/svg/icon-b.svg'
    import iconc from 'tui-image-editor/dist/svg/icon-c.svg'
    import icond from 'tui-image-editor/dist/svg/icon-d.svg'

    const blackTheme = { // or white
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
    import TeacherVideo from '@/components/liveBroadcast/TeacherVideoForStudent'
    import StudentVideo from '@/components/liveBroadcast/StudentVideoForStudent'
    import StudentInfo from '@/components/liveBroadcast/StudentInfo'

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
                wideMax: 30, // 最大线宽
                textSize: 20, // 字体大小
                colorList: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#29b6f6', '#2E3E50'],
                // -----------rtcRoom数据---------------
                studentId: '', // 学生id
                studentName: '',
                teacherId: '1',
                teacherName: '',
                peerIdList: [], // 所有学生的ID
                rtcRoom: null,
                studentNameObj: {}, // 每个学生的姓名
                studentOnStageId: '', // 上台学生id
                roomId: '',
                studentOnStageName: '', // 上台学生姓名
                otherStudentOnStage: false, // 其他学生上台
                // -----------playarea基础数据---------------
                iframeSrc: '',
                showPicture: false, // 控制视频平铺
                controlStudentOperate: false, // 控制学生操作
                // -----------基础数据---------------
                mode: 'animate', // 直播模式
                mikeStatus: true, // 开启麦克风
                showStudentStatus: true, // student video中的状态栏显示
                hideStudentStatus: false, // 隐藏状态栏
                studentVideoScale: 2.06, // 学生区域缩放倍数
                studentOnStage: false, // 学生上台状态
                // -----------课件动画数据---------------
                coursewareResource: [],
                resourceIndex: 0, // 课件播放序号
            }
        },
        components: {
            NetStatus,
            MikeStatus,
            Speaker,
            TeacherVideo,
            StudentVideo,
            StudentInfo
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
        },
        computed: {
            // 视频铺满区域的动态宽度
            pictureCoveredWidth () {
                const width = 377
                const length = this.peerIdList.length
                if (length === 0) {
                    return width
                }else if (length === 1) {
                    return width * 2
                }else {
                    return width * 3
                }
            }
        },
        created () {
            this.init()
        },
        mounted () {
            this.getClassInfo()
            this.paint()
            this.getDrawData()
        },
        methods: {
            // 初始化
            init () {
                const rtcRoom = new RTCRoom()
                const host = 'www2.9man.com'
                const port = 3210
                const roomId = '9n474171ko' // 9n474171ko
                const peerId = (Math.ceil(Math.random() * 100) + 1).toString()
                const userParams = {name: '小王' + peerId, headUrl: '', role: 2}
                this.studentId = peerId
                this.roomId = roomId
                const teacherId = this.teacherId
                this.studentName = userParams.name

                rtcRoom.joinRoom(host,port,roomId,peerId,userParams);
                // this.iframeSrc = `/syncshuxe/start.html?path=3-1&roomId=${roomId}&peerId=${peerId}`
                this.rtcRoom = rtcRoom

                // 同步状态
                rtcRoom.on('message-notify-receive', (peerId, data) => {
                    if (data.type === 'synchronize') { // 状态同步
                        const result = data.values
                        for (let key in result) {
                            this[key] = result[key]
                        }
                        this.drawByShape();
                        this.changeAnimate(this.$event, 1)
                    }else if (data.type === 'controlStudentOperate') { // 控制学生操作
                        const status = data.status

                        if (status === 1) {
                            this.controlStudentOperate = true
                        } else {
                            this.controlStudentOperate = false
                        }
                    }
                })

                // 用户加入时更新peerIdList
                rtcRoom.on('user-joined',(id) => {
                    console.log('用户进入：' + id)
                    if (id === peerId) {
                        rtcRoom.getAllRoomUser().forEach(item => {
                            const peerId = item._peerId
                            if (peerId !== teacherId && peerId !== this.studentId) {
                                this.studentNameObj[peerId] = item.name
                                this.peerIdList.push(peerId)
                            }
                            if (peerId === teacherId) {
                                this.teacherName = item.name
                            }
                        })
                        // 用户连接成功成功发送请求同步数据
                        this.$nextTick(function () {
                            this.pageMounted()
                        })
                    }
                    // console.log(this.peerIdList.includes(id));
                    if (!this.peerIdList.includes(id) && id !== teacherId && id !== this.studentId) {
                        const info = rtcRoom.getRoomUser(id);
                        this.studentNameObj[id] = info.name
                        this.peerIdList.push(id)
                    }
                })

                // 用户离开时更新peerIdList
                rtcRoom.on('user-leaved',(id) => {
                    console.log('用户离开：' + id, this.peerIdList.indexOf(id))
                    delete this.studentNameObj[id]
                    const index = this.peerIdList.indexOf(id)
                    if (index !== -1) {
                        this.peerIdList.splice(index, 1)
                    }
                });
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

            // 页面加载完成后发送消息给老师，用于同步数据
            pageMounted () {
                const params = {
                    type: 'pageDone',
                }
                this.rtcRoom.notifyMessage(params, this.teacherId)
            },

            // 获取课堂信息
            getClassInfo () {
                const params = {
                    identity: 1,
                    pageno: 1,
                    pagesize: 10
                }
                this.$axios.get(this.$store.state.rootUrl + '/v1/classRoom/queryClassSchedule', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            const classInfo = data.data.data
                            const coursewareId = classInfo[0]['courseware_id']
                            this.getCoursewareInfo(coursewareId)
                        } else {

                        }
                    })
                    .catch(() => {

                    })
            },

            // 获取课件信息
            getCoursewareInfo (id) {
                const params = {
                    id
                }
                this.$axios.get(this.$store.state.rootUrl + '/v1/courseware/queryCoursewareDetail', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.coursewareResource = data.data.data.resource
                            this.changeAnimate(this.$event, 1) // 载入课件
                        } else {

                        }
                    })
                    .catch(() => {

                    })
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
                instance.on('mousedown', function(event) {
                    // const shape = _this.shape;
                    const canvasSize = instance.getCanvasSize()
                    // const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                    // const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                    const e = {
                        screenX: event.screenX,
                        screenY: event.screenY,
                        clientX: event.layerX,
                        clientY: event.layerY,
                        canvasWidth: canvasSize.width
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
                            clientX: event.layerX,
                            clientY: event.layerY,
                        }
                        const params = {
                            type: 'mousemove',
                            e
                        }
                        _this.sendDrawData(params)
                    };

                    //鼠标抬起事件
                    document.onmouseup = function (event) {
                        // const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                        // const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                        const e = {
                            screenX: event.screenX,
                            screenY: event.screenY,
                            clientX: event.layerX,
                            clientY: event.layerY,
                        }
                        const params = {
                            type: 'mouseup',
                            e
                        }
                        _this.sendDrawData(params)

                        canvas.onmousemove = null;
                        document.onmouseup = null
                    }
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
                Object.assign(params, {id: this.studentId})
                this.rtcRoom.sendMessage(params, this.teacherId)
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
                if (type === 1) { // 视频
                    this.mode = 'video'
                    const video = this.$refs['video-play']
                    video.src = resourceUrl + url
                    video.pause();
                }else if (type === 2) { // 动画
                    this.mode = 'animate'
                    this.iframeSrc = '/' + resourceUrl + url + `&roomId=${this.roomId}&peerId=` + this.studentId
                }
            },

            //接收画图数据，建立连接
            getDrawData () {
                const upperCanvas = document.querySelector('.upper-canvas')
                const canvas = document.querySelector('#tui-image-editor');
                const video = this.$refs['video-play']

                const event = document.createEvent("MouseEvents");
                this.rtcRoom.on('message-receive', (data) => {
                    // if (data.id === this.studentId) return
                    console.log(data)
                    const type = data.type
                    const e = data.e
                    let scrollLeft = ''
                    let scrollTop = ''
                    if (e) {
                        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                        scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                    }
                    if (type === 'setStrokeWidth') {
                        this.strokeWidth = data.strokeWidth
                    }else if (type === 'setStrokeColor') {
                        this.strokeColor = data.strokeColor
                    }else if (type === 'setFill') {
                        this.fill = data.fill
                    }else if (type === 'FREE_DRAWING') {
                        this.shape = 'FREE_DRAWING'
                        this.drawByShape()
                    }else if (type === 'SHAPE') {
                        this.shape = 'SHAPE'
                        this.drawingShape = data.drawingShape
                        this.drawByShape()
                    }else if (type === 'TEXT') {
                        this.shape = 'TEXT'
                        this.drawByShape()
                    }else if (type === 'editingText') {
                        const text = data.text;
                        if (!text) return;
                        this.imageEditor.changeText(data.id, text);
                    }else if (type === 'ERASER') {
                       this.eraser()
                    }else if (type === 'CLEARALL') {
                        this.clearAll()
                    }else if (type === 'UNDO') {
                        this.undo()
                    }else if (type === 'NORMAL') {
                        this.shape = 'NORMAL'
                    }else if (type === 'stopDrawing') {
                        this.stopDrawing()
                    } else if (type === 'mousedown') {
                        event.initMouseEvent("mousedown", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            e.clientX - scrollLeft, e.clientY - scrollTop,
                            false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(event);
                        this.drawByShape()
                    }else if (type === 'mousemove') {
                        event.initMouseEvent("mousemove", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            e.clientX - scrollLeft, e.clientY - scrollTop,
                            false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(event);

                    }else if (type === 'mouseup') {
                        event.initMouseEvent("mouseup", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            e.clientX - scrollLeft, e.clientY - scrollTop,
                            false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(event);
                        this.imageEditor.stopDrawingMode(); //即时更换线条颜色
                        this.drawByShape();
                        canvas.onmousemove = null;
                    }else if (type === 'pictureCovered') { // 视频铺满
                        this.showPicture = true
                    }else if (type === 'cancelPictureCovered') { // 取消视频铺满
                        this.showPicture = false
                    }else if (data.type === 'controlStudentOperate') { // 控制学生操作
                        const status = data.status

                        if (status === 1) {
                            this.controlStudentOperate = true
                        } else {
                            this.controlStudentOperate = false
                        }
                    }else if (type === 'changeMode') { // 切换模式
                        this.mode = data.mode
                    }else if (type === 'onStage-small') {// 学生上台 小屏
                        const id = data.id
                        const name = data.name
                        this.studentOutStage(id)
                        this.studentOnStage = true
                        if (id === this.studentId) { // 上台学生是自己时
                            const targetDom = document.getElementById('video' + id)
                            targetDom.classList.add('onStage')
                        } else {
                            this.otherStudentOnStage = true
                            this.studentOnStageId = id
                            this.studentOnStageName = name
                        }
                    }else if (type === 'onStage-big') { // 学生上台 大屏
                        const id = data.id
                        const name = data.name
                        this.studentOutStage(id)
                        this.studentOnStage = false
                        const targetDom = document.getElementById('video' + id)
                        targetDom.classList.add('onStage-big')
                        if (id !== this.studentId) {
                            this.otherStudentOnStage = true
                            this.studentOnStageId = id
                            this.studentOnStageName = name
                        }
                    }else if (type === 'outStage') { // 学生下台
                        const id = data.id
                        this.studentOutStage(id)
                    }else if (type === 'init') { // 全部操作时，通知学生发送初始化数据到画板
                        this.synchronize(this.studentId)
                    }else if (type === 'control_video_play') { // 控制视频播放
                        const isplay = data.isplay
                        if (isplay) {
                            video.play()
                        }else {
                            video.pause();
                        }
                    }else if (type === 'control_video_progress') { // 控制视频播放
                        const progress = data.progress
                        video.currentTime = progress * video.duration
                    }else if (type === 'animate_page_change') { // 控制视频播放
                        this.resourceIndex = data.page
                        this.changeAnimate()
                    }
                });
            },

            // 学生下台
            studentOutStage(id) {
                this.studentOnStage = false
                const targetDom = document.getElementById('video' + id)
                targetDom.classList.remove('onStage', 'onStage-big')
                this.otherStudentOnStage = false
                this.studentOnStageId = ''
                this.studentOnStageName = ''
            },

            // 当学生连接时同步状态
            synchronize(id) {
                const params = {
                    type: 'synchronize',
                    id,
                    values: {
                        strokeWidth: this.strokeWidth,
                        strokeColor: this.strokeColor,
                        fill: this.fill,
                        shape: this.shape
                    }
                }
                this.rtcRoom.sendMessage(params, this.teacherId)
            },

        }
    }
</script>

<style lang="less">
    .liveBroadcast-student-container {
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
                    height: 800px;
                    left: 22px;
                    top: 22px;
                    opacity: 0;
                    z-index: 99;
                }
                .fade-picture-enter {
                    opacity: 0;
                    bottom: 0;
                    transform: scale(0);
                }
                .fade-picture-leave-to {
                    opacity: 0;
                    bottom: 0;
                    transform: scale(0);
                }
                .fade-picture-enter-active,.fade-picture-leave-active {
                    transition: all .5s ease;
                }
                .picture-covered-container {
                    height: 710px;
                    width: 1150px;
                    left: 22px;
                    top: 22px;
                    position: absolute;
                    .picture-covered {
                        position: absolute;
                        max-height: 504px;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        .picture-covered-box {
                            padding: 8px;
                            float: left;
                        }
                    }
                }
                .dragStudentVideo-container {
                    position: absolute;
                    opacity: 0;
                    transform: scale(0);
                    z-index: 999;
                    &.dragStudentVideo {
                        animation: drag-animate .5s ease;
                        animation-fill-mode: forwards;
                    }
                    &.dragStudentVideoCenter {
                        animation: drag-animate-center .5s ease;
                        animation-fill-mode: forwards;
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
                    .mode-picture {
                        display: flex;
                        justify-content: space-between;
                        > span {
                            height: 55px;
                            width: 55px;
                            display: inline-block;
                            cursor: pointer;
                        }
                        .draw-operate {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background-color: #fff;
                            width:100%;
                            height:64px;
                            border-radius:20px;
                            padding: 0 183px;
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
                    .student-list {
                        margin-top: 16px;
                        display: flex;
                        justify-content: flex-start;
                        > div {
                            margin-right: 45px;
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
                    height: 416px;
                    margin-bottom: 84px;
                    overflow: hidden;
                    .student-on-stage-box {
                        height: 100%;
                    }
                }
                .video-students {
                    width: 100%;
                }
            }
        }
    }
</style>
