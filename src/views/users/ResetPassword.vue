<template>
    <div class="resetPassword-container">
        <main>
            <header>修改密码</header>
            <a-form
                    :form="form"
                    :hideRequiredMark="hideRequiredMark"
            >
                <a-form-item
                        label="手机号:"
                        :label-col="{ span: 4 }"
                        :wrapper-col="{ span: 19, offset: 1 }"
                        :colon="colon"
                >
                    <a-input size="large" type="number" oninput="if (value.length > 11){value = value.slice(0,11)}"
                             autocomplete="off" :defaultValue="telephone" readonly style="border-bottom: 0"
                    />
                </a-form-item>
                <a-form-item
                        label="验证码:"
                        :label-col="{ span: 4 }"
                        :wrapper-col="{ span: 19, offset: 1 }"
                        :colon="colon"
                >
                    <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}"
                             autocomplete="off" size="large"
                             v-decorator="[
                                             'VerificationCode',
                                             {rules: [
                                              { required: true, message: '请输入验证码' },
                                             { pattern: /^\d{6}$/, message: '验证码错误' }
                                             ]}
                                           ]"
                    />
                    <span :class="{getVerificationCode: true, alreadyGetCode}" @click="sendVerificationCode">{{verificationCodeText}}</span>
                </a-form-item>
                <a-form-item
                        label="新密码:"
                        :label-col="{ span: 4 }"
                        :wrapper-col="{ span: 19, offset: 1 }"
                        :colon="colon"
                >
                    <a-input type="password" size="large"
                             v-decorator="[
                                             'password',
                                             {rules: [
                                              { required: true, message: '请输入新密码' },
                                             { pattern: /^[0-9a-zA-Z]{6,}$/, message: '长度不能小于6位,不能有特殊字符和空格' }
                                             ]}
                                           ]"
                    />
                </a-form-item>
            </a-form>
            <div class="submit">
                <a-button>取消</a-button>
                <a-button type="primary">确认</a-button>
            </div>
        </main>
    </div>
</template>

<script>
    export default {
        name: "ResetPassword",
        data () {
            return {
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                form: this.$form.createForm(this),
                colon: false,  //label中的冒号
                timeOut: '',
                telephone: 13547875877
            }
        },
        methods: {
            //发送验证码
            sendVerificationCode () {
                if (this.alreadyGetCode) return;
                const params = {
                    mobile: this.telephone,
                    type: 0
                };
                this.$axios.get( '/indexapp.php?c=sendMessage&a=sendSms', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code == 200) {
                            //倒计时60s
                            this.$message.success('验证码发送成功',5);
                            if (this.timeOut) {
                                return
                            }
                            let oneMinute = 60;
                            this.alreadyGetCode = true;
                            this.verificationCodeText = oneMinute + 's';
                            oneMinute --;
                            this.timeOut = setInterval(() => {
                                if (oneMinute <= 0) {
                                    this.alreadyGetCode = false;
                                    this.verificationCodeText = '获取验证码';
                                    clearInterval(this.timeOut);
                                    this.timeOut = false;
                                } else {
                                    this.verificationCodeText = oneMinute + 's';
                                    oneMinute --;
                                }

                            }, 1000);
                        } else {
                            this.$message.warning(data.msg,5);
                        }
                    })
                    .catch(err => {

                    })


            },
        }
    }
</script>

<style lang="less">
    .resetPassword-container {
        height: 100%;
        background-color: #fafafa;
        padding-top: 129px;
        main {
            width:1200px;
            height:460px;
            background:rgba(255,255,255,1);
            border-radius:10px;
            margin: 0 auto;
            overflow: hidden;
            position: relative;
            header {
                height:60px;
                line-height: 60px;
                text-align: center;
                background:rgba(252,201,58,1);
                font-size:20px;
                color:rgba(76,76,76,1);
            }
            form {
                width: 352px;
                margin: 62px auto 0;
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button{
                    -webkit-appearance: none !important;
                }
                input[type="number"]{
                    -moz-appearance:textfield;
                }
                .ant-form-item-label {
                    label {
                        font-size:12px;
                        color:rgba(102,102,102,1);
                    }
                }
                .ant-form-item {
                    margin-bottom: 26px;
                }
                .ant-form-item-with-help {
                    margin-bottom: 0;
                }
                .ant-form-item-control {
                    .ant-input {
                        border: 0;
                        border-bottom: 2px solid #F3F3F3;
                        font-size:18px;
                        color:rgba(51,51,51,1);
                        border-radius: unset;
                        &:focus {
                            box-shadow: unset;
                        }
                        &:hover {
                            border-color: #F3F3F3!important;
                        }
                    }
                    .ant-form-explain {
                        font-size:14px;
                        font-weight:400;
                        color:rgba(255,109,136,1);
                        margin-top: 5px;
                    }
                    .getVerificationCode {
                        width:120px;
                        height:36px;
                        line-height: 36px;
                        background:rgba(252,201,58,1);
                        border-radius:8px;
                        position: absolute;
                        right: 0;
                        top: -14px;
                        color:#333;
                        cursor: pointer;
                        text-align: center;
                        font-size:12px;
                        &.alreadyGetCode {
                            color: #333;
                        }
                    }
                }
            }
            .submit {
                text-align: center;
                position: absolute;
                left: 0;
                bottom: 65px;
                width: 100%;
                button {
                    width:180px;
                    height:48px;
                    border-radius:10px;
                    font-size:20px;
                    color:rgba(51,51,51,1);
                    &:first-of-type {
                        margin-right: 40px;
                        border: 0;
                        background-color: #f3f3f3;
                    }
                }
            }
        }
    }
</style>
