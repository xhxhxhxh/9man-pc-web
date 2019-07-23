<script src="../../js/tui-image-editor-copy.js"></script>
<template>
    <div class="LiveBroadcast-container">
        <div class="select-bar">
            <div class="draw-operate">
                <div :class="{pencil: true, selected: shape === 'LINE_DRAWING' || shape === 'FREE_DRAWING'}"
                     @mouseenter="showPencilItem = true" @mouseleave="showPencilItem = false">
                    <div class="pencil-item" v-show="showPencilItem">
                        <span @click="() => {shape === 'LINE_DRAWING'? stopDrawing(): shape = 'LINE_DRAWING'; drawByShape()}"
                              :class="{selected: shape === 'LINE_DRAWING'}"></span>
                        <span @click="() => {shape === 'FREE_DRAWING'? stopDrawing(): shape = 'FREE_DRAWING'; drawByShape()}"
                              :class="{selected: shape === 'FREE_DRAWING'}"></span>
                    </div>
                </div>
                <div :class="{shape: true, selected: shape === 'SHAPE'}" @mouseenter="showShapeItem = true" @mouseleave="showShapeItem = false">
                    <div class="shape-item" v-show="showShapeItem">
                        <span :class="{rect: true, selected: drawingShape === 'rect' && !fill && shape === 'SHAPE'}"
                              @click="() => {shape === 'SHAPE' && drawingShape === 'rect' && !fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'rect'; fill = false; drawByShape()}"></span>
                        <span :class="{circle: true, selected: drawingShape === 'circle' && !fill && shape === 'SHAPE'}"
                              @click="() => {shape === 'SHAPE' && drawingShape === 'circle' && !fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'circle'; fill = false; drawByShape()}"></span>
                        <span class="line"></span>
                        <span :class="{fillRect: true, selected: drawingShape === 'rect' && fill && shape === 'SHAPE'}"
                              @click="() => {shape === 'SHAPE' && drawingShape === 'rect' && fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'rect'; fill = true; drawByShape()}"></span>
                        <span :class="{fillCircle: true, selected: drawingShape === 'circle' && fill && shape === 'SHAPE'}"
                              @click="() => {shape === 'SHAPE' && drawingShape === 'circle' && fill? stopDrawing(): shape = 'SHAPE'; drawingShape = 'circle'; fill = true; drawByShape()}"></span>
                    </div>
                </div>
                <div class="wide" @mouseenter="showStrokeWide = true" @mouseleave="showStrokeWide = false">
                    <div class="wide-item" v-show="showStrokeWide">
                        <a-slider id="test" :defaultValue="2" :max="wideMax" v-model="strokeWidth" />
                    </div>
                </div>
                <div class="color" @mouseenter="showColorItem = true" @mouseleave="showColorItem = false">
                    <div class="color-item" v-show="showColorItem">
                        <span v-for="(item, index) in colorList" :key="index" :style="{backgroundColor: item, borderColor: item}"
                        @mousedown="() => {strokeColor = item}" :class="{selected: strokeColor === item}"></span>
                    </div>
                </div>
                <div :class="{text: true, selected: shape === 'TEXT'}" @click="() => {shape === 'TEXT'? stopDrawing(): shape = 'TEXT'; drawByShape()}"
                     @mouseenter="showTextItem = true" @mouseleave="showTextItem = false">
                    <div class="text-item" v-show="showTextItem">
                        <a-slider id="test2" :max="80" :min="10" v-model="textSize" />
                    </div>
                </div>
                <div class="line"></div>
                <div class="eraser" @click="eraser"></div>
                <div class="delete" @click="clearAll"></div>
                <div class="back" @click="undo"></div>
            </div>
            <div class="action">
                <div class="action-item"><span><a-icon type="plus" style="margin-right: 10px"/>添加课件</span></div>
                <div class="action-item"><span>上传图片<a-icon type="up" style="margin-left: 10px"/></span></div>
                <div class="action-item"><span>切换线路<a-icon type="up" style="margin-left: 10px"/></span></div>
                <div class="action-item"><span><img class="icon" src="./images/refresh.png">刷新课堂</span></div>
                <div class="start-class">
                    <a-button>开始上课</a-button>
                    <span class="time">01:50:30</span>
                </div>
            </div>
        </div>
        <div class="liveBroadcast-area clearfix">
            <div id="tui-image-editor"></div>
            <div class="coursewareOperate clearfix">
                <div class="selectBar">
                    <button>课件</button>
                    <button>小黑板</button>
                    <button>图片</button>
                    <button>动画</button>
                </div>
                <div class="goBack">
                    <button></button>
                    <button></button>
                </div>
                <div class="scale">
                    <div class="line"></div>
                    <button></button>
                    <button></button>
                </div>
            </div>
            <div class="video">
                <div class="teacher"></div>
                <div class="student"></div>
                <div class="avatar"></div>
            </div>
            <div class="chat">
                <div class="content" ref="chatContent">
                    <p class="host">877777777777867676876764646546546465465464654645646546546546546546464897</p>
                    <p class="guest">877777777777867676876764646546546465465464654645646546546546546546464897</p>
                    <p class="host" v-for="(item, index) in chatList" :key="index">{{item}}</p>
                </div>
                <div class="operate">
                    <a-input placeholder="请输入文字内容" size="large" @pressEnter="addChat" :value="chatValue" @change="chatValueChange"/>
                    <div class="upload">
                        <a-upload name="images" :multiple="true" accept="image/*">
                            <a-button>
                            </a-button>
                        </a-upload>
                        <a-upload name="file" :multiple="true" class="uploadFile">
                            <a-button>
                            </a-button>
                        </a-upload>
                    </div>
                    <a-button class="send" @click="addChat">发送</a-button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    const ImageEditor = require('tui-image-editor');
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
    import exampleImg from './images/example.png'
    export default {
        name: "LiveBroadcast",
        data () {
            return {
                shape: 'NORMAL',
                imageEditor: null,
                imageEditorCopy: null, //自改造tui-image
                showPencilItem: false, //显示直线类型选项
                showShapeItem: false, //显示形状类型选项
                showStrokeWide: false, //显示线宽选项
                showColorItem: false, //显示颜色选项
                showTextItem: false, //显示文字选项
                drawingShape: '', // 绘制的图形样式
                fill: false, //填充图形
                strokeWidth: 8,  //线宽
                strokeColor: '#000000', //线的颜色
                wideMax: 30, // 最大线宽
                textSize: 20, // 字体大小
                colorList: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#29b6f6', '#3498DB', '#9B59B6', '#2E3E50'],
                chatList: [], //聊天内容
                chatValue: '', // 聊天框的值
                addedChat: false, //添加聊天内容后的状态

            }
        },
        created () {

        },
        mounted () {
            this.paint();
            this.getDrawData();
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
        watch: {

        },
        methods: {
            // 画图
            paint () {
                // var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
                //     includeUI: {
                //         loadImage: {
                //             path: exampleImg,
                //             name: 'SampleImage'
                //         },
                //         theme: blackTheme,
                //         initMenu: 'filter',
                //         menuBarPosition: 'bottom'
                //     },
                //     cssMaxWidth: 1042,
                //     cssMaxHeight: 783,
                //     selectionStyle: {
                //         cornerSize: 20,
                //         rotatingPointOffset: 70
                //     }
                // });
                // this.imageEditor = instance;

                //tui-image-copy
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
                    cssMaxWidth: 1042,
                    cssMaxHeight: 783,
                    selectionStyle: {
                        cornerSize: 20,
                        rotatingPointOffset: 70
                    }
                });
                this.imageEditorCopy = instanceCopy;
                this.imageEditor = instanceCopy;
                const _this = this;
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
                imageEditor.ui.text.fontSize = this.textSize;
                imageEditor.ui.text._els.textColorpicker.color = this.strokeColor;
                imageEditor.startDrawingMode('TEXT');

            },

            //橡皮擦功能
            eraser () {
                const imageEditor = this.imageEditor;
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

            //聊天
            addChat () {
                const value = this.chatValue;
                if (value.trim()) {
                    this.chatList.push(value);
                    this.chatValue = '';
                    this.addedChat = true;
                }
            },

            //聊天框值改变
            chatValueChange (e) {
                const { value } = e.target;
                this.chatValue = value
            },

            //接收画图数据，建立连接
            getDrawData () {
                const socket = io('http://localhost:3000'); // 建立websocket连接
                socket.on('chat message', (data) => {
                    // console.log(data)
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
                    } else if (data.mode === 'TEXT') {
                        const text = data.text;
                        if (!text) return;
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
                    } else {
                        this.imageEditorCopy.startDrawingMode(data.mode, data.setting, data)
                    }

                });
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
    .LiveBroadcast-container {
        width: 100%;
        min-width: 1903px;
        background: url("./images/background.png") no-repeat center;
        background-size: cover;
        padding: 30px;
        .select-bar {
            width: 100%;
            height: 70px;
            background:rgba(255,255,255,1);
            border-radius:10px;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            .draw-operate {
                display: flex;
                justify-content: space-between;
                > div {
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    margin-right: 25px;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                    cursor: pointer;
                    transition: all .2s;
                    position: relative;
                    > div {
                        height:34px;
                        border-radius:0 0 10px 10px;
                        background-color: #fff;
                        position: absolute;
                        left: 0;
                        bottom: -34px;
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
                        width:90px;
                        span {
                            &:first-of-type {
                                background: url("./images/line.png") no-repeat center;
                                &:hover {
                                    border: 2px solid #FF6A04;
                                }
                                &.selected {
                                    border: 2px solid #FF6A04;
                                }
                            }
                            &:last-of-type {
                                background: url("./images/curve.png") no-repeat center;
                                &:hover {
                                    border: 2px solid #FF6A04;
                                }
                                &.selected {
                                    border: 2px solid #FF6A04;
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
                    .wide-item {
                        width: 161px;
                        .ant-slider {
                            width: 100%;
                            margin: 5px 0;
                        }
                    }
                }
                .color {
                    background-image: url("./images/color.png");
                    &:hover {
                        background-image: url("./images/color-selected.png");
                    }
                    .color-item {
                        width: 146px;
                        height: 78px;
                        bottom: -78px;
                        flex-wrap: wrap;
                        span {
                            width: 24px;
                            height: 24px;
                            margin-right: 10px;
                            border-radius: 4px;
                            &:nth-of-type(4n) {
                                margin-right: 0;
                            }
                            &:hover {
                                border: 2px solid #FF6A04 !important;
                            }
                            &.selected {
                                border: 2px solid #FF6A04 !important;
                            }
                        }
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
                    .text-item {
                        width: 161px;
                        .ant-slider {
                            width: 100%;
                            margin: 5px 0;
                        }
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
            .action {
                display: flex;
                align-items: center;
                justify-content: stretch;
                font-size:16px;
                color: #FF6A04;
                .action-item {
                    height: 20px;
                    border-right: 2px solid #e6e6e6;
                    padding: 0 40px;
                    line-height: 20px;
                    span {
                        cursor: pointer;
                    }
                    .icon {
                        margin-right: 10px;
                    }
                }
                .start-class {
                    margin-left: 40px;
                    display: flex;
                    button {
                        width: 140px;
                        height: 40px;
                        background-image: url("./images/button.png");
                        border: 0;
                        color: #fff;
                        font-size: 16px;
                        box-shadow: unset;
                        border-radius: 30px;
                        margin-right: 20px;
                    }
                    .time {
                        font-size: 24px;
                        margin-right: 10px;
                    }
                }
            }

        }
        #tui-image-editor {
            width: 1080px !important;
            height: 901px !important;
            margin-top: 20px;
            padding: 20px;
            background-color: rgba(255,203,167,1);
            border-radius:10px;
            float: left;
            .tui-image-editor-main-container {
                width: 1042px;
                height: 783px;
                top: 20px;
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
        .liveBroadcast-area {
            position: relative;
            height: 921px;
            .coursewareOperate {
                position: absolute;
                left: 86px;
                bottom: 32px;
                height: 48px;
                button {
                    border: 0;
                    cursor: pointer;
                    outline: none;
                }
                .selectBar {
                    font-size: 0;
                    float: left;
                    button {
                        width:150px;
                        height:48px;
                        background-color:#fff;
                        background-image: none;
                        border-radius:10px;
                        font-size: 18px;
                        color: #FF6700;
                        & + button {
                            margin-left: 10px;
                        }
                        &:hover {
                            background-image:linear-gradient(0deg,rgba(255,138,58,1),rgba(255,103,0,1));
                            color: #fff;
                        }
                    }
                }
                .goBack {
                    float: left;
                    margin-left: 40px;
                    margin-right: 25px;
                    height: 48px;
                    padding-top: 3px;
                    button {
                        width: 42px;
                        height: 42px;
                        border-radius: 50%;
                        background-size: cover;
                        &:first-child {
                            background-image: url("./images/previous.png");
                            margin-right: 25px;
                        }
                        &:last-child {
                            background-image: url("./images/next.png");
                        }
                    }
                }
                .scale {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    .line {
                        width:2px;
                        height:18px;
                        background:rgba(255,255,255,.4);
                    }
                    button {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background-size: cover;
                        &:first-of-type {
                            background-image: url("./images/plus.png");
                            margin: 0 25px;
                        }
                        &:last-child {
                            background-image: url("./images/minus.png");
                        }
                    }
                }
            }
            .video {
                float: left;
                width: 402px;
                padding: 20px;
                height: 100%;
                > div {
                    height: 240px;
                    margin-bottom: 20px;
                    background:rgba(255,203,167,.8);
                    border-radius:10px;
                }
            }
            .chat {
                float: left;
                margin-top: 20px;
                padding: 20px;
                width:360px;
                height:901px;
                border-radius:10px;
                background: rgba(255,203,167,.8) url("./images/chat.png") no-repeat center;
                .content {
                    height: 741px;
                    padding: 0 11px;
                    overflow: auto;
                    &::-webkit-scrollbar {
                        width: 6px;
                    }
                    &::-webkit-scrollbar-track {
                        background-color: rgba(0,0,0,0);
                    } /* 滚动条的滑轨背景颜色 */

                    &::-webkit-scrollbar-thumb {
                        border-radius: 3px;
                        background-color: unset;
                    } /* 滑块颜色 */

                    &::-webkit-scrollbar-button {
                        height: 0;
                    } /* 滑轨两头的监听按钮颜色 */

                    &::-webkit-scrollbar-corner {
                        height: 0;
                    }
                    &:hover {
                        &::-webkit-scrollbar-thumb {
                            background-color: rgba(255, 255, 255, 0.6);
                        }
                    }
                    p {
                        word-wrap:break-word;
                        border-radius: 10px;
                        font-size: 16px;
                        padding: 6px 15px;
                        margin-bottom: 10px;
                        position: relative;
                    }
                    .host {
                        background-color: #fff;
                        &::before {
                            content: "";
                            width: 13px;
                            height: 15px;
                            background: url("./images/arrow.png") no-repeat center;
                            position: absolute;
                            top: 50%;
                            left: -10px;
                            transform: translate(0, -50%);
                        }
                    }
                    .guest {
                        background-color: #45CE7C;
                        color: #fff;
                        &::before {
                            content: "";
                            width: 13px;
                            height: 15px;
                            background: url("./images/arrow-right.png") no-repeat center;
                            position: absolute;
                            top: 50%;
                            right: -10px;
                            transform: translate(0, -50%) rotate(180deg);
                        }
                    }
                }
                .operate {
                    position: relative;
                    margin-top: 5px;
                    input {
                        height:50px;
                        border-radius:10px;
                        padding-left: 20px;
                        border: 0;
                    }
                    .upload {
                        display: flex;
                        justify-content: space-between;
                        width: 86px;
                        margin-top: 25px;
                        .ant-upload {
                            button {
                                width: 34px;
                                height: 30px;
                                border: 0;
                                background: url("./images/uploadImage.png") no-repeat center;
                            }
                        }
                        .uploadFile button {
                            background: url("./images/uploadFile.png") no-repeat center;
                        }
                    }
                    .send {
                        width:120px;
                        height:40px;
                        background:linear-gradient(0deg,rgba(255,138,58,1),rgba(255,103,0,1));
                        border-radius:10px;
                        border: 0;
                        color: #fff;
                        position: absolute;
                        top: 70px;
                        right: 0;
                    }
                }
            }
        }
    }
</style>
