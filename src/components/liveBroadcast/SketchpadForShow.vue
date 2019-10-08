<template>
    <div class="sketchpadForShow-container" :style="{ transform: `scale(${canvasScale})`}">
        <div :id="'sketchpad' + id" class="sketchpad"></div>
        <div class="wrapper"></div>
    </div>
</template>

<script>
    const ImageEditor = require('../../../../tui-image-editor/dist/tui-image-editor-copy.min');
    // var ImageEditor = require('tui-image-editor');
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

    export default {
        name: "SketchpadForShow",
        data () {
            return {
                imageEditor: null,
                shape: 'NORMAL',
                fill: false, //填充图形
                strokeWidth: 11,  //线宽
                strokeColor: '#2E3E50', //线的颜色
                canvasScale: 600 / 1152, // canvas缩放倍数
                drawingShape: '',
            }
        },
        props: ['id', 'offsetValue'],
        created() {

        },
        mounted() {
            this.init()
            this.getDrawData()
        },
        methods: {
            // 初始化
            init () {
                const sketchpadId = '#sketchpad' + this.id
                const instance = new ImageEditor(document.querySelector(sketchpadId), {
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
                const canvas = document.querySelector(sketchpadId);
                const upperCanvas = document.querySelector(`${sketchpadId} .upper-canvas`)

                instance.on('mousedown', function(event, originPointer) {
                    _this.drawByShape()

                    document.onmouseup = function (event) {
                        instance.stopDrawingMode();
                        _this.drawByShape()
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
                const sketchpadId = '#sketchpad' + this.id
                const rtcRoom = this.$store.state.liveBroadcast.rtcRoom
                const canvas = document.querySelector(sketchpadId);
                const upperCanvas = document.querySelector(`${sketchpadId} .upper-canvas`)

                const event = document.createEvent("MouseEvents");
                rtcRoom.on('message-receive', (data) => {
                    if (data.id !== this.id) return
                    const canvasScale = this.canvasScale
                    const type = data.type
                    const e = data.e

                    let clientX = ''
                    let clientY = ''
                    if (e) {
                        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
                        const offsetValue = this.offsetValue
                        const [canvasOffsetLeft, canvasOffsetTop] = [offsetValue.offsetLeft - scrollLeft, offsetValue.offsetTop - scrollTop]
                        clientX = e.clientX * canvasScale + canvasOffsetLeft
                        clientY = e.clientY * canvasScale + canvasOffsetTop
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
                            clientX, clientY,
                            false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(event);
                        this.drawByShape()
                    }else if (type === 'mousemove') {
                        event.initMouseEvent("mousemove", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            clientX, clientY,
                            false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(event);

                    }else if (type === 'mouseup') {
                        event.initMouseEvent("mouseup", true, true, document.defaultView, 0, e.screenX, e.screenY,
                            clientX, clientY,
                            false, false, false, false, 0, null);
                        upperCanvas.dispatchEvent(event);
                        this.imageEditor.stopDrawingMode(); //即时更换线条颜色
                        this.drawByShape();
                        canvas.onmousemove = null;
                    }else if (type === 'synchronize') { // 状态同步
                        const result = data.values
                        for (let key in result) {
                            this[key] = result[key]
                        }
                        this.drawByShape();
                    }

                });
            }

        }
    }
</script>

<style lang="less">
    .sketchpadForShow-container {
        transform-origin: left top;
        position: relative;
        .wrapper {
            position: absolute;
            width: 1152px;
            height: 710px;
            left: 0;
            top: 0;
            z-index: 999;
        }
        .sketchpad {
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
    }
</style>
