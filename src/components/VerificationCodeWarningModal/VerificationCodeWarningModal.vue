<template>
    <div class="verification-code-warning-modal">
        <a-modal
                :visible="visible"
                class="warning-modal"
                style="top: 200px;"
                :maskClosable="maskClosable"
                :closable="maskClosable"
                :footer="null"
        >
            <div class="content">
                <p>验证码获取次数过多，12小时内无法短信登录<br>请使用密码登录或求助课程顾问</p>
                <p>(联系方式：15558067572)</p>
                <a-button type="primary" @click="closeWarningModal"><span>确定</span><span>{{countdown + 's'}}</span></a-button>
            </div>
        </a-modal>
    </div>
</template>

<script>
    export default {
        name: "VerificationCodeWarningModal",
        data () {
            return {
                timeOut: '',
                countdown : 10,
                maskClosable: false
            }
        },
        props: ['visible', 'close'],
        watch:{
            visible: function (val) {
                if (val) {
                    this.timeOut = setInterval(() => {
                        if (this.countdown <= 0) {
                            this.closeWarningModal();
                        } else {
                            this.countdown --;
                        }
                    }, 1000);
                }
            }
        },
        methods: {
            closeWarningModal () {
                this.close();
                clearInterval(this.timeOut);
                setTimeout(() => {
                    this.countdown = 10;
                }, 500)
            }
        }
    }
</script>

<style lang="less">
    @import "../../less/index.less";
    .warning-modal {
        width:423px !important;
        height:274px;
        border-radius:20px;
        overflow: hidden;
        background-color: rgba(248,84,21,.8);
        padding: 10px;
        .ant-modal-content {
            height: 100%;
            background-color: #fff;
            border-radius:20px;
            overflow: hidden;
            .ant-modal-body {
                padding: 0;
            }
            .content {
                p {
                    margin-top: 55px;
                    font-size:16px;
                    color: #434343;
                    text-align: center;
                    margin-bottom: 0;
                    &:last-of-type {
                        margin-top: 18px;
                        margin-bottom: 17px;
                    }
                }
                button {
                    display: block;
                    margin: 0 auto;
                    width:138px;
                    height:40px;
                    background:@themeColor;
                    border-radius:6px;
                    font-size: 20px;
                    color: #fff;
                    span:first-of-type {
                        margin-right: 10px;
                    }
                }
            }
        }

    }
</style>
