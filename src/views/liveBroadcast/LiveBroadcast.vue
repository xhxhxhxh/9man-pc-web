<template>
    <div class="LiveBroadcast-container">
        <div class="select-bar">
            <div class="draw-operate">
                <div class="pencil" @mouseenter="showPencilItem = true" @mouseleave="showPencilItem = false">
                    <div class="pencil-item" v-show="showPencilItem">
                        <span @click="drawByShape(shape = 'LINE_DRAWING')">—</span>
                        <span @click="drawByShape(shape = 'FREE_DRAWING')">~</span>
                    </div>
                </div>
                <div class="shape" @mouseenter="showShapeItem = true" @mouseleave="showShapeItem = false">
                    <div class="shape-item" v-show="showShapeItem">
                        <span :class="{rect: true, selected: drawingShape === 'rect' && !fill}" @click="drawByShape(shape = 'SHAPE',drawingShape = 'rect', fill = false)"></span>
                        <span :class="{circle: true, selected: drawingShape === 'circle' && !fill}" @click="drawByShape(shape = 'SHAPE',drawingShape = 'circle', fill = false)"></span>
                        <span class="line"></span>
                        <span :class="{fillRect: true, selected: drawingShape === 'rect' && fill}" @click="drawByShape(shape = 'SHAPE',drawingShape = 'rect', fill = true)"></span>
                        <span :class="{fillCircle: true, selected: drawingShape === 'circle' && fill}" @click="drawByShape(shape = 'SHAPE',drawingShape = 'circle', fill = true)"></span>
                    </div>
                </div>
                <div class="wide" @mouseenter="showStrokeWide = true" @mouseleave="showStrokeWide = false">
                    <div class="wide-item" v-show="showStrokeWide">
                        <a-slider id="test" :defaultValue="2" :max="wideMax" v-model="strokeWidth" />
                    </div>
                </div>
                <div class="color"></div>
                <div class="text"></div>
                <div class="line"></div>
                <div class="eraser"></div>
                <div class="delete"></div>
                <div class="back"></div>
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
        <div id="tui-image-editor"></div>
    </div>
</template>

<script>
    var ImageEditor = require('tui-image-editor');
    import 'tui-image-editor/dist/tui-image-editor.min.css'
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
                drawingShape: '', // 绘制的图形样式
                fill: false, //填充图形
                strokeWidth: 2,  //线宽
                strokeColor: 'red', //线的颜色
                wideMax: 30, // 最大线宽
            }
        },
        mounted () {
            this.paint()
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
                    cssMaxWidth: 1020,
                    cssMaxHeight: 762,
                    selectionStyle: {
                        cornerSize: 20,
                        rotatingPointOffset: 70
                    }
                });
                this.imageEditor = instance;
                const _this = this;
                instance.on('mousedown', function(event, originPointer) {
                    _this.drawByShape()
                });
                document.onmouseup = function () {
                    instance.stopDrawingMode();
                    _this.drawByShape()
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
            }
        }
    }
</script>

<style lang="less" scoped>
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
        height: 100%;
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
                        }
                    }
                }
                .pencil {
                    background-image: url("./images/pencil.png");
                    &:hover {
                        background-image: url("./images/pencil-selected.png");
                    }
                    .pencil-item {
                        width:90px;
                        span {
                            text-align: center;
                            line-height: 22px;
                        }
                    }
                }
                .shape {
                    background-image: url("./images/shape.png");
                    &:hover {
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
                }
                .text {
                    background-image: url("./images/text.png");
                    margin-right: 0;
                    &:hover {
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
            width: 1020px !important;
            height: 761px !important;
        }
    }
</style>
