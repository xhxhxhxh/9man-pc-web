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
    var ImageEditor = require('tui-image-editor');
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
                socket: null,
                sendDataStatus: 'end', //发送数据的状态
                objectActivatedId: '', // 选中对象的id
            }
        },
        created () {
            const socket = io('http://localhost:3000'); // 建立websocket连接
            this.socket = socket
        },
        mounted () {
            this.paint()
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
            objectActivatedId: function (val, oldVal) {
               if (!val) {
                   if (oldVal) { // 禁用图形缩放功能
                       this.imageEditor.setObjectProperties(oldVal, {
                                   lockScalingX: true,
                                   lockScalingY: true,
                                   lockRotation: true
                               });
                   }
               }
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
                    cssMaxWidth: 1042,
                    cssMaxHeight: 783,
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
                    _this.objectActivatedId = props.id;
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
                                fontSize: _this.textSize
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

                //鼠标点击事件
                instance.on('mousedown', function(event, originPointer) {
                    const shape = _this.shape;
                    const objectId = instance.activeObjectId;
                    if (!objectId) {
                        _this.objectActivatedId = ''; // 无选中目标时，设置objectActivatedId为空
                    }
                    console.log(originPointer);
                    if (shape === 'NORMAL' || shape === 'TEXT') return;
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
                    }else if (shape === 'SHAPE') {
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
                imageEditor.ui.text.fontSize = this.textSize;
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
                    id: this.objectActivatedId
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

            //发送画图数据
            sendDrawData (params) {
                this.socket.emit('chat message', params)
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
