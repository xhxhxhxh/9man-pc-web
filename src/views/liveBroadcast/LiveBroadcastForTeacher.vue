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
            </div>
        </div>
        <main class="clearfix" ref="main">
            <div class="videoArea" :style="{width: videoAreaWidth}">
                <div class="video-teacher" v-show="showPicture">
                    <TeacherVideo @pictureCovered="pictureCovered" teacherVideoScale="1"></TeacherVideo>
                </div>
                <div class="video-students">
                    <p class="title" v-show="showPicture">班级成员：</p>
                    <StudentVideo id="1" :dragVideoId="dragVideoId" @startDragVideo="startDragVideo" @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"></StudentVideo>
                    <StudentVideo id="2" :dragVideoId="dragVideoId" @startDragVideo="startDragVideo" @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"></StudentVideo>
                    <StudentVideo id="3" :dragVideoId="dragVideoId" @startDragVideo="startDragVideo" @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"></StudentVideo>
                    <StudentVideo id="4" :dragVideoId="dragVideoId" @startDragVideo="startDragVideo" @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"></StudentVideo>
                    <StudentVideo id="5" :dragVideoId="dragVideoId" @startDragVideo="startDragVideo" @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"></StudentVideo>
                    <StudentVideo id="6" :dragVideoId="dragVideoId" @startDragVideo="startDragVideo" @endDragVideo="endDragVideo" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus"></StudentVideo>
                    <p class="operateStudentsVideo" v-show="!showPicture">
                        <button @click="cancelPictureCovered"><img src="./images/cover.png" alt="">取消铺满</button>
                        <button><img src="./images/mute.png" alt="">全部禁音</button>
                        <button><img src="./images/control.png" alt="">全部操作</button>
                    </p>
                </div>:
            </div>
            <div class="playArea" v-show="showPicture" @drop.stop="videoDropIn" @dragover.prevent="() => {}" ref="playArea">
                <div id="tui-image-editor" ref="editArea" v-show="mode === 'picture'"></div>
                <div class="wrapper" v-show="showWrapper && mode === 'animate'"></div>
                <div class="animate-area" v-show="mode === 'animate'" ref="animateArea">
<!--                    <iframe src="/kejian/shaoer/shuxue/start.html?path=3-1&tdsourcetag=s_pcqq_aiomsg" scrolling="no"-->
<!--                            frameborder="0" ref="iframe"></iframe>-->
                </div>
                <div class="operate">
                    <div class="mode-animate" v-show="mode === 'animate'">
                        <span class="play"></span>
                        <a-slider id="test" :defaultValue="30" :disabled="disabled" />
                        <span class="back"></span>
                        <span class="fast-forward"></span>
                        <span class="skip"></span>
                    </div>
                    <div class="mode-picture" v-show="mode === 'picture'">
                        <div class="draw-operate">
                            <div :class="{pencil: true, selected: shape === 'LINE_DRAWING' || shape === 'FREE_DRAWING'}"
                                 @mouseenter="showPencilItem = true" @mouseleave="showPencilItem = false"
                                 @click="() => {shape === 'FREE_DRAWING'? stopDrawing(): shape = 'FREE_DRAWING'; drawByShape()}">
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
                                 @click="() => {shape === 'SHAPE'? stopDrawing(): shape = 'SHAPE'; drawingShape = 'rect'; fill = false; drawByShape()}">
                                <div class="shape-item" v-show="showShapeItem">
                                    <span :class="{rect: true, selected: drawingShape === 'rect' && !fill && shape === 'SHAPE'}"
                                    @click.stop="() => {shape === 'SHAPE' && drawingShape === 'rect' && !fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'rect'; fill = false; drawByShape()}"></span>
                                    <span :class="{circle: true, selected: drawingShape === 'circle' && !fill && shape === 'SHAPE'}"
                                          @click.stop="() => {shape === 'SHAPE' && drawingShape === 'circle' && !fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'circle'; fill = false; drawByShape()}"></span>
                                    <span class="line"></span>
                                    <span :class="{fillRect: true, selected: drawingShape === 'rect' && fill && shape === 'SHAPE'}"
                                          @click.stop="() => {shape === 'SHAPE' && drawingShape === 'rect' && fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'rect'; fill = true; drawByShape()}"></span>
                                    <span :class="{fillCircle: true, selected: drawingShape === 'circle' && fill && shape === 'SHAPE'}"
                                          @click.stop="() => {shape === 'SHAPE' && drawingShape === 'circle' && fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'circle'; fill = true; drawByShape()}"></span>
                                </div>
                            </div>
                            <div :class="{text: true, selected: shape === 'TEXT'}" @click="() => {shape === 'TEXT'? stopDrawing(): shape = 'TEXT'; drawByShape()}"></div>
                            <div class="line"></div>
                            <div class="eraser" @click="eraser"></div>
                            <div class="delete" @click="clearAll"></div>
                            <div class="back" @click="undo"></div>
                        </div>
                        <span class="back"></span>
                        <span class="fast-forward"></span>
                        <span class="skip"></span>
                    </div>
                    <div class="mode">
                        <button @click="mode = 'animate'" :class="{active: mode === 'animate'}">动画</button>
                        <button @click="mode = 'picture'" :class="{active: mode === 'picture'}">图片</button>
                    </div>
                </div>
                <DragStudentVideo :dragVideoId="dragVideoId" @startDragStudentVideo="startDragStudentVideo" @endDragStudentVideo="endDragVideo"
                                  v-show="showDragVideo" :class="{dragStudentVideo: showDragVideo, dragStudentVideoCenter: showDragVideoCenter}"
                                  :style="{top: dragVideoPosition.y, left: dragVideoPosition.x}"
                                  :dragStudentVideoScale="dragVideoPosition.dragStudentVideoScale"></DragStudentVideo>
            </div>
        </main>
    </div>
</template>

<script>
    var ImageEditor = require('../../../../tui-image-editor/dist/tui-image-editor-copy.min');
    import 'tui-image-editor/dist/tui-image-editor.min.css'
    import icona from 'tui-image-editor/dist/svg/icon-a.svg'
    import iconb from 'tui-image-editor/dist/svg/icon-b.svg'
    import iconc from 'tui-image-editor/dist/svg/icon-c.svg'
    import icond from 'tui-image-editor/dist/svg/icon-d.svg'
    const io = require('socket.io-client/dist/socket.io.js')
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

    // 导入直播组件
    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    import Speaker from '@/components/liveBroadcast/Speaker'
    import TeacherVideo from '@/components/liveBroadcast/TeacherVideo'
    import StudentVideo from '@/components/liveBroadcast/StudentVideo'
    import DragStudentVideo from '@/components/liveBroadcast/DragStudentVideo'

    export default {
        name: "LiveBroadcast",
        data () {
            return {
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
                chatList: [], //聊天内容
                chatValue: '', // 聊天框的值
                addedChat: false, //添加聊天内容后的状态
                socket: null,
                sendDataStatus: 'end', //发送数据的状态
                objectActivatedId: '', // 选中对象的id
                disabled: false, // 控制播放器滑块
                mode: 'picture', // 直播模式
                dragVideoId: '', // 被拖拽的视频id
                dragVideoIdCache: '', // 被拖拽的视频id暂存
                dragVideoPosition: {x: '22px', y: '22px', offsetX: 0, offsetY: 0, dragStudentVideoScale: 1}, // 拖拽视频位置
                fullScreenVideoPosition: {offsetX: '1084px', offsetY: '710px'},
                showDragVideo: false, // 控制被拖拽的视频显示
                showDragVideoCenter: false, // 使视频居中
                showWrapper: false, // 显示遮挡层
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
            DragStudentVideo
        },
        created () {
            const socket = io('http://localhost:3000'); // 建立websocket连接
            this.socket = socket
        },
        mounted () {
            this.paint()
            // this.initIframe()
        },
        updated () {
            if (this.addedChat) {
                const chatContent = this.$refs.chatContent;
                const height = chatContent.offsetHeight;
                const scrollHeight = chatContent.scrollHeight;
                if (scrollHeight > height) {
                    chatContent.scrollTop = scrollHeight - height
                }
                this.addedChat = false
            }

        },
        methods: {
            // 画图
            paint () {
                var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
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
                let lastProperties = {}; // 初始选中对象参数

                instance.on('addObjectAfter', function(prop){
                    instance.setObjectProperties(prop.id, {
                        lockScalingX: true,
                        lockScalingY: true,
                        lockRotation: true
                    });
                });
                //图形被移动事件
                instance.on('objectMoved', function(props) {
                    const params = {};
                    const id = props.id;
                    const lastPropertiesById = lastProperties[id];

                    if (lastPropertiesById) {
                        lastPropertiesById.left = props.left;
                        lastPropertiesById.top = props.top;
                        params.properties = lastPropertiesById;
                    } else {
                        params.properties = props;
                    }
                    params.event = 'objectMoved';
                    _this.sendDrawData(params);
                });

                let currentMousePositionX = '';
                let currentMousePositionY = '';

                //图形被选中时存储id
                instance.on('objectActivated', function(props) {
                    document.onmousemove = function (e) {
                        const objectId = instance.activeObjectId;
                        currentMousePositionX = e.layerX;
                        currentMousePositionY = e.layerY;
                        if (!objectId) {
                            document.onmousemove = null
                        }
                    }
                });

                //图形被缩放事件
                instance.on('objectScaled', function(props) {
                    if (props.type !== 'line') return;
                    const id = props.id;
                    const type = props.type;
                    const params = {};
                    if (!lastProperties[id]) {
                        lastProperties[id] = {...props};
                    }
                    // console.log(lastProperties[id]);
                    const lastPropertiesById = lastProperties[id];
                    const left = props.left;
                    const top = props.top;
                    const lastLeft = lastPropertiesById.left;
                    const lastTop = lastPropertiesById.top;
                    const strokeWidth = lastPropertiesById.strokeWidth;
                    let lastwidth = lastPropertiesById.width;
                    let lastheight = lastPropertiesById.height;
                    let scaleX = currentMousePositionX >= lastLeft ? (lastwidth / 2 + left - lastLeft) / (lastwidth / 2): (lastwidth / 2 - left + lastLeft) / (lastwidth / 2);
                    let scaleY = currentMousePositionY >= lastTop ? (lastheight / 2 + top - lastTop) / (lastheight / 2): (lastheight / 2 - top + lastTop) / (lastheight / 2);
                    if (lastwidth <= 0) {
                        lastwidth = 1;
                        scaleX = 1
                    }else if (lastheight <= 0) {
                        lastheight = 1;
                        scaleY = 1
                    }
                    props.width = lastwidth * scaleX;
                    props.height = lastheight * scaleY;
                    // props.strokeWidth = strokeWidth * scaleX * scaleY;
                    lastProperties[id] = props;
                    // console.log(instance.getObjectPosition(props.id, 'left', 'top'));


                    params.properties = props;
                    params.event = 'objectScaled';
                    // console.log(lastProperties, scaleX, scaleY);
                    _this.sendDrawData(params)
                });

                // 添加文字事件
                instance.on('addText', function(pos) {
                    const objectId = instance.activeObjectId;
                    canvas.onmousedown = function () {
                        if (!instance.activeObjectId) {
                            const text = instance._graphics._objects[objectId].text;
                            const position = instance.getObjectPosition(objectId, 'left', 'top');
                            const styles = {
                                fill: _this.strokeColor,
                                fontSize: _this.strokeWidth * 2
                            };
                            const params = {
                                mode: _this.shape,
                                position,
                                styles,
                                text
                            };
                            _this.sendDrawData(params);
                            canvas.onmousedown = null;
                        }
                    }
                });

                // 编辑文字事件
                instance.on('textEditing', function() {
                    const objectId = instance.activeObjectId;
                    console.log(objectId);
                    canvas.onmousedown = function () {
                        if (!instance.activeObjectId) {
                            const text = instance._graphics._objects[objectId].text;
                            const params = {
                                mode: 'editingText',
                                text,
                                id: objectId
                            };
                            _this.sendDrawData(params);
                            canvas.onmousedown = null;
                        }
                    }
                });

                //鼠标点击事件
                instance.on('mousedown', function(event, originPointer) {
                    const shape = _this.shape;
                    const objectId = instance.activeObjectId;
                    _this.sendDataStatus = 'start'; //开始发送数据
                    const start = {
                        mode: _this.shape,
                        event: 'start',
                    };
                    const params = {
                        mode: _this.shape,
                        event: 'mousedown',
                        position: originPointer,
                    };
                    let setting = null;
                    if (shape === 'LINE_DRAWING' || shape === 'FREE_DRAWING') {
                        setting = {
                            width: _this.strokeWidth,
                            color: _this.strokeColor
                        };
                    }else if (shape === 'SHAPE' || shape === 'NORMAL' || shape === 'TEXT') {
                        setting = {
                            fill: _this.fill? _this.strokeColor: 'transparent',
                            stroke: _this.strokeColor,
                            strokeWidth: _this.strokeWidth,
                        };
                        const type = _this.drawingShape;
                        const e = {};
                        for (let i in event) {
                            if (typeof event[i] === "object") {
                                continue
                            }
                            e[i] = event[i]
                        }
                        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                        e.clientX = e.clientX + scrollLeft
                        e.clientY = e.clientY + scrollTop
                        if (shape === 'NORMAL' || shape === 'TEXT') { // 处理正常状态下的鼠标点击
                            start.mode = 'SHAPE'
                            params.mode = 'SHAPE'
                            start.special = 'mousedown-normal'
                            params.event = 'mousedown-normal'
                        }
                        Object.assign(start, {type: type});
                        Object.assign(params, {e: e});
                    }

                    Object.assign(start, {setting: setting});
                    Object.assign(params, {setting: setting});

                    _this.sendDrawData(start);
                    _this.sendDrawData(params);

                    _this.drawByShape();

                    //鼠标移动事件
                    canvas.onmousemove = function (e) {
                        if (shape === 'NORMAL' || shape === 'TEXT') return
                        params.position = {x: e.layerX, y: e.layerY};
                        params.event = 'mousemove';
                        _this.sendDrawData(params)
                    };
                });

                //鼠标抬起事件
                document.onmouseup = function () {
                    if ( _this.sendDataStatus === 'start') {
                        _this.sendDataStatus = 'end';
                        const params = {
                            mode: _this.shape,
                            event: 'mouseup',
                            setting: {
                                width: _this.strokeWidth,
                                color: _this.strokeColor
                            },
                        };
                        _this.sendDrawData(params)
                    };
                    instance.stopDrawingMode(); //即时更换线条颜色
                    _this.drawByShape();
                    canvas.onmousemove = null;
                }
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
                if (!objectId) return;
                const params = {
                    mode: 'ERASER',
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
            },

            //清除所有
            clearAll () {
                const imageEditor = this.imageEditor;
                imageEditor.clearObjects();

                // 发送清除图形请求
                const params = {
                    mode: 'CLEARALL'
                };
                this.sendDrawData(params);
            },

            //返回上一步
            undo () {
                const imageEditor = this.imageEditor;
                imageEditor.undo().catch(() => {});

                // 发送撤销请求
                const params = {
                    mode: 'UNDO'
                };
                this.sendDrawData(params);
            },

            //发送画图数据
            sendDrawData (params) {
                this.socket.emit('chat message', params)
            },

            // 开始视频拖拽
            startDragVideo(params) {
                this.showWrapper = true
                this.dragVideoIdCache = params.id
                this.dragVideoPosition.offsetX = params.x
                this.dragVideoPosition.offsetY = params.y
            },

            // 画图区域的学生视频开始拖拽
            startDragStudentVideo(params) {
                this.showWrapper = true
                this.dragVideoIdCache = params.id
                this.fullScreenVideoPosition.offsetX = params.x
                this.fullScreenVideoPosition.offsetY = params.y
            },

            // 拖拽结束
            endDragVideo() {
                this.showWrapper = false
            },

            // 视频被拖拽进入
            videoDropIn(e) {
                if(this.showDragVideo) {
                    this.showDragVideo = false
                    return this.$nextTick(function () {
                        this.videoDropIn(e)
                    })
                }else {
                    this.showDragVideo = true
                }
                let editArea = null
                if (this.mode === 'picture') {
                    editArea = this.$refs.editArea
                }else if (this.mode === 'animate') {
                    editArea = this.$refs.animateArea
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
                // console.log(e,this.dragVideoPosition.offsetX,this.dragVideoPosition.offsetY,offsetX,offsetY);

                if (offsetX > editAreaWidth / 2 &&  offsetY > editAreaHeight / 2) { // studentVideo全屏
                    const scale = editAreaHeight / 271
                    if (this.dragVideoPosition.dragStudentVideoScale === 1) {
                        this.dragVideoPosition.x = offsetX - this.fullScreenVideoPosition.offsetX * scale + 'px'
                        this.dragVideoPosition.y = offsetY - this.fullScreenVideoPosition.offsetY * scale + 'px'
                    }else {
                        this.dragVideoPosition.x = offsetX - this.fullScreenVideoPosition.offsetX + 'px'
                        this.dragVideoPosition.y = offsetY - this.fullScreenVideoPosition.offsetY + 'px'
                    }
                    this.dragVideoPosition.dragStudentVideoScale = scale
                    this.showDragVideoCenter = true


                }else {
                    this.showDragVideoCenter = false
                    this.dragVideoPosition.dragStudentVideoScale = 1
                    this.dragVideoPosition.x = offsetX - this.dragVideoPosition.offsetX * 1.34 + 'px' // 1.34为当前视频与原视频尺寸的放大倍数
                    this.dragVideoPosition.y = offsetY - this.dragVideoPosition.offsetY * 1.34 + 'px'
                }
            },

            // 移除拖拽的视频
            removeDragStudentVideo() {
                if (this.dragVideoIdCache === this.dragVideoId) {
                    this.showDragVideo = false
                    this.dragVideoId = ''
                    this.dragVideoPosition.dragStudentVideoScale = 1
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
                this.showPicture = false
                this.showStudentStatus = false
                const main = this.$refs.main
                const mainWidth = main.offsetWidth
                this.videoAreaWidth = '100%'
                this.studentVideoScale = (mainWidth - 120) / 3 / 308
            },

            // 取消画面铺满
            cancelPictureCovered() {
                this.showPicture = true
                this.showStudentStatus = true
                this.videoAreaWidth = '637px'
                this.studentVideoScale = 1
            }

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
    @keyframes drag-animate {
        to {
            top: 22px;
            left: 22px;
            opacity: 1;
            transform: scale(1);
        }
    }
    @keyframes drag-animate-center {
        to {
            top: 22px;
            left: 50%;
            opacity: 1;
            transform: scale(1) translate(-50%, 0);
        }
    }
    .LiveBroadcast-container {
        width: 100%;
        min-width: 1920px;
        background: url("./images/background.png") no-repeat center;
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
                            width: 782px;
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
    }
</style>
