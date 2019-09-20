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
            </div>
        </div>
        <main class="clearfix" ref="main">
            <div class="videoArea" :style="{width: videoAreaWidth}">
                <div class="video-teacher" v-show="showPicture">
                    <TeacherVideo teacherVideoScale="2.06" :hiddenOperate="hiddenTeacherOperate"></TeacherVideo>
                </div>
                <div class="video-students">
                    <StudentVideo id="1" :dragVideoId="dragVideoId" :studentVideoScale="studentVideoScale" :showStudentStatus="showStudentStatus" :draggdisable="draggdisable"></StudentVideo>
                </div>:
            </div>
            <div class="playArea" ref="playArea">
                <div id="tui-image-editor" ref="editArea" v-show="mode === 'picture'"></div>
                <div class="wrapper" v-show="mode === 'animate'"></div>
                <div class="animate-area" v-show="mode === 'animate'" ref="animateArea">
<!--                    <iframe src="/kejian/shaoer/shuxue/start.html?path=3-1&tdsourcetag=s_pcqq_aiomsg" scrolling="no"-->
<!--                            frameborder="0" ref="iframe"></iframe>-->
                </div>
                <div class="operate">
                    <div class="mode-picture">
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
                    </div>
                    <div class="student-list">
                        <StudentInfo></StudentInfo>
                        <StudentInfo></StudentInfo>
                        <StudentInfo></StudentInfo>
                        <StudentInfo></StudentInfo>
                        <StudentInfo></StudentInfo>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
    var ImageEditor = require('tui-image-editor');
    const ImageEditorCopy = require('../../../../tui-image-editor/dist/tui-image-editor-copy.min');
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
    import StudentInfo from '@/components/liveBroadcast/StudentInfo'

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
                socket: null,
                sendDataStatus: 'end', //发送数据的状态
                objectActivatedId: '', // 选中对象的id
                disabled: false, // 控制播放器滑块
                mode: 'picture', // 直播模式
                dragVideoId: '', // 被拖拽的视频id
                mikeStatus: true, // 开启麦克风
                showPicture: true, // 控制视频平铺
                videoAreaWidth: '637px', // 播放区域宽度
                showStudentStatus: true, // student video中的状态栏显示
                studentVideoScale: 2.06, // 学生区域缩放倍数
                hiddenTeacherOperate: true, // 隐藏老师视频操作界面
                draggdisable: true, // 禁止学生视频被拖拽
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
        created () {

        },
        mounted () {
            this.paint()
            this.getDrawData();
        },
        methods: {
            // 画图
            paint () {
                var instanceCopy = new ImageEditorCopy(document.querySelector('#tui-image-editor'), {
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
                this.imageEditorCopy = instanceCopy;
                this.imageEditor = instanceCopy;
                const _this = this;

                //禁止图形缩放
                instanceCopy.on('addObjectAfter', function(prop){
                    instanceCopy.setObjectProperties(prop.id, {
                        lockScalingX: true,
                        lockScalingY: true,
                        lockRotation: true
                    });
                });

                instanceCopy.on('mousedown', function(event, originPointer) {
                    document.onmousemove = function () {

                    }
                    _this.drawByShape()
                });
                document.onmouseup = function () {
                    instanceCopy.stopDrawingMode();
                    _this.drawByShape()
                    document.onmousemove = null
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
            },

            //返回上一步
            undo () {
                const imageEditor = this.imageEditor;
                imageEditor.undo().catch(() => {});
            },

            //接收画图数据，建立连接
            getDrawData () {
                const socket = io('http://localhost:3000'); // 建立websocket连接
                socket.on('chat message', (data) => {
                    console.log(data)
                    if (data.event === 'objectMoved' || data.event === 'objectScaled') {
                        const props = data.properties;
                        const left = props.left;
                        const top = props.top;
                        const width = props.width;
                        const height = props.height;
                        const strokeWidth = props.strokeWidth;

                        this.imageEditorCopy.setObjectProperties(props.id, {
                            left,
                            top,
                            width,
                            height,
                        });
                    } else if (data.mode === 'TEXT' || data.mode === 'editingText') {
                        const text = data.text;
                        if (!text) return;
                        if (data.mode === 'editingText') {
                            this.imageEditorCopy.changeText(data.id, text);
                            return
                        }
                        this.imageEditorCopy.addText(text, {
                            styles: data.styles,
                            position: data.position
                        });
                        this.imageEditorCopy.startDrawingMode(data.mode, data.setting, data)
                    }else if (data.mode === 'ERASER') {
                        const id = data.id;
                        if (!id) return;
                        this.imageEditorCopy.removeObject(id);
                    }else if (data.mode === 'CLEARALL') {
                        this.imageEditorCopy.clearObjects();
                    }else if (data.mode === 'UNDO') {
                        this.imageEditorCopy.undo().catch(() => {});
                    }else {
                        this.imageEditorCopy.startDrawingMode(data.mode, data.setting, data)
                        //创建事件对象
                        // e = data.e
                        // var event = document.createEvent("MouseEvents");
                        // event.initMouseEvent("mousedown", true, true, document.defaultView, 0, e.screenX, e.screenY, e.clientX, e.clientY,
                        //     false, false, false, false, 0, null);
                        // document.querySelector('.upper-canvas').dispatchEvent(event);
                    }

                });
            }

        }
    }
</script>

<style lang="less">
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
    .liveBroadcast-student-container {
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
                        justify-content: space-between;
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
                }
                .video-students {
                    width: 100%;
                }
            }
        }
    }
</style>
