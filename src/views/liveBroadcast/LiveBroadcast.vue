<template>
    <div class="LiveBroadcast-container">
        <div class="select-bar">
            <div class="draw-operate">
                <span class="pencil"></span>
                <span class="shape"></span>
                <span class="wide"></span>
                <span class="color"></span>
                <span class="text"></span>
                <span class="line"></span>
                <span class="eraser"></span>
                <span class="delete"></span>
                <span class="back"></span>
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
    </div>
</template>

<script>
    export default {
        name: "LiveBroadcast"
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
                span {
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    margin-right: 25px;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                    cursor: pointer;
                    transition: all .2s;
                }
                .pencil {
                    background-image: url("./images/pencil.png");
                    &:hover {
                        background-image: url("./images/pencil-selected.png");
                    }
                }
                .shape {
                    background-image: url("./images/shape.png");
                    &:hover {
                        background-image: url("./images/shape-selected.png");
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
    }
</style>
