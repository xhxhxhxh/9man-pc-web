<template>
    <div class="systemTest-container">
        <div class="text">
            <p>您的电脑操作系统是{{data.system}}，无法正常上课，建议：</p>
            <p class="advise">
                1.升级至Windows7/10（请咨询专业人士或课程顾问） <br>
                2.更换设备（电脑/平板/手机）
            </p>
        </div>
        <div class="my-code">
            <p>如需更换设备，请打开微信扫一扫以下二维码</p>
            <div class="code-box">
                <div class="phone box">
                    <div class="left"><p>手机上课</p></div>
                    <div class="right">
                        <div class="code1">
                            <img src="../../home/images/android-download.png" alt="">
                            <p>(安卓手机)</p>
                        </div>
                        <div class="code2">
                            <img src="../../home/images/ios-download.png" alt="">
                            <p>(苹果手机)</p>
                        </div>
                    </div>
                </div>
                <div class="ipad box">
                    <div class="left"><p style="width: 40px">ipad</p><p>上课</p></div>
                    <div class="right">
                        <div class="code">
                            <img src="../../home/images/ios-download.png" alt="">
                            <p>(ipad)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SystemTest",
        props: ['data']
    }
</script>

<style lang="less" scoped>
    @import "../../../less/index.less";
    .systemTest-container {
        padding: 0 45px 35px;
        p {
            color: #312C2C;
            font-size: 18px;
            margin: 0;
            &.advise {
                font-size: 16px;
            }
        }
        .text {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
        .my-code {
            margin-top: 20px;
            font-size: 16px;
            border:2px solid @themeColor;
            border-radius:20px;
            padding: 20px 50px 30px;
            p {
                text-align: center;
            }
            .code-box {
                height: 330px;
                margin-top: 10px;
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                .box {
                    height:150px;
                    &.phone {
                        .left {
                            background:linear-gradient(0deg,rgba(255,181,70,1),rgba(255,81,59,1));
                        }
                        .right {
                            display: flex;
                            justify-content: space-between;
                            div {
                                img {
                                    width: 77px;
                                    display: block;
                                }
                                p {
                                    font-size:14px;
                                    text-align: center;
                                    color: #312C2C;
                                    margin-top: 6px;
                                }
                            }
                        }
                    }
                    &.ipad {
                        .left {
                            background:linear-gradient(0deg,rgba(70,174,255,1),rgba(73,59,255,1));
                            padding: 39px 10px;
                            p:last-of-type {
                                margin-left: 10px;
                            }
                        }
                        .right {
                            display: flex;
                            justify-content: space-between;
                            div {
                                img {
                                    width: 77px;
                                    display: block;
                                }
                                p {
                                    font-size:14px;
                                    text-align: center;
                                    color: #312C2C;
                                    margin-top: 6px;
                                }
                            }
                        }
                    }
                    .left {
                        width:60px;
                        height:100%;
                        float: left;
                        border-radius:10px 0 0 10px;
                        padding: 27px 20px;
                        p {
                            width: 20px;
                            font-size: 20px;
                            color: #fff;
                            text-align: center;
                            margin: 0;
                            line-height: 1.2;
                        }
                    }
                    .right {
                        overflow: hidden;
                        height: 100%;
                        background-color: #EBEBEB;
                        border-radius:0 10px 10px 0;
                        padding: 24px 44px;
                    }
                }
            }
        }
    }
</style>
