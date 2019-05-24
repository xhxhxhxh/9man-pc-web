<template>
    <div class="login-container">
        <div class="banner">
            <div class="bannerInfo">
                <div class="login">
                    <div class="loginItem">
                        <header>
                            <div :class="{account: true, selectedItem: login == 'account'}" @click="login = 'account'"><span>账号登录</span></div>
                            <div :class="{telephone: true, selectedItem: login == 'telephone'}" @click="login = 'telephone'"><span>手机登录</span></div>
                        </header>
                        <main>
                            <a-form
                                    :form="form"
                                    @submit="handleSubmit"
                                    :hideRequiredMark="hideRequiredMark"
                            >
                                <a-form-item
                                        label="手机号"
                                        :label-col="{ span: 5 }"
                                        :wrapper-col="{ span: 17, offset: 2 }"
                                >
                                    <a-input size="large" type="number" oninput="if (value.length > 11){value = value.slice(0,11)}"
                                             autocomplete="off"
                                            v-decorator="[
                                                            'telephone',
                                                            {rules: [
                                                            { required: true, message: '请输入正确的手机号' },
                                                            { pattern: /1\d{10}/, message: '请输入正确的手机号' }

                                                            ]}
                                                          ]"
                                    />
                                </a-form-item>
                                <a-form-item
                                        label="密码"
                                        :label-col="{ span: 5 }"
                                        :wrapper-col="{ span: 17, offset: 2 }"
                                        v-show="login == 'account'"
                                >
                                    <a-input type="password"
                                            v-decorator="[
                                                            'password',
                                                            {rules: [
                                                             { required: true, message: '请输入密码' },
                                                            { min: 6, message: '密码错误' }
                                                            ]}
                                                          ]"
                                    />
                                </a-form-item>
                                <a-form-item
                                        label="验证码"
                                        :label-col="{ span: 5 }"
                                        :wrapper-col="{ span: 17, offset: 2 }"
                                        v-show="login == 'telephone'"
                                >
                                    <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}"
                                             v-decorator="[
                                                            'VerificationCodeInput',
                                                            {rules: [
                                                             { required: true, message: '请输入验证码' },
                                                            { pattern: /\d{6}/, message: '验证码错误' }
                                                            ]}
                                                          ]"
                                    />
                                </a-form-item>
                                <a-form-item
                                        :wrapper-col="{ span: 24 }"
                                >
                                    <a-button
                                            type="primary"
                                            html-type="submit"
                                            size="large"
                                    >
                                        登 录
                                    </a-button>
                                </a-form-item>
                            </a-form>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data () {
            return {
                login: 'account',
                form: this.$form.createForm(this),
                hideRequiredMark: true
            }
        },
        methods: {
            handleSubmit (e) {
                e.preventDefault();
                this.form.validateFields((err, values) => {
                    console.log(values);
                    if (!err) {
                        console.log('Received values of form: ', values);
                    }
                });
            },
        }
    }
</script>

<style lang="less">
    .login-container {
        nput::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        .banner {
            height: 514px;
            background: url("images/banner.png") no-repeat center;
            background-size: cover;
            padding: 82px 46px 0;
            .bannerInfo {
                height: 600px;
                background: url("images/banner-info.png") no-repeat center;
                background-size: contain;
                position: relative;
                .login {
                    width:600px;
                    height:577px;
                    position: absolute;
                    top: 100px;
                    right: 270px;
                    .loginItem {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        width: 100%;
                        header {
                            height: 85px;
                            > div {
                                width: 50%;
                                height: 100%;
                                padding: 0 30px;
                                font-size:24px;
                                font-weight:400;
                                color:rgba(102,102,102,1);
                                text-align: center;
                                line-height: 85px;
                                background:rgba(255,255,255,.5);
                                float: left;
                                cursor: pointer;
                                position: relative;
                                &.selectedItem {
                                    height: 120px;
                                    line-height: 110px;
                                    background: #fff;
                                    font-size:32px;
                                    font-weight:400;
                                    color:rgba(255,146,6,1);
                                    transform: translate(0, -25px);
                                    border-radius: 10px 10px 0 0;
                                    span {
                                        height: 100%;
                                        display: block;
                                        border-bottom: 2px solid #F3F3F3;
                                    }
                                }
                            }
                            .account {
                                border-radius: 10px 0 0 0;
                                &.selectedItem:after {
                                    content: '';
                                    width: 10px;
                                    height: 10px;
                                    position: absolute;
                                    bottom: 10px;
                                    right: -10px;
                                    background: radial-gradient(at 10px 0px, transparent 10px, #fff 10px);
                                }

                            }
                            .telephone {
                                border-radius: 0 10px 0 0;
                                &.selectedItem:after {
                                    content: '';
                                    width: 10px;
                                    height: 10px;
                                    position: absolute;
                                    bottom: 10px;
                                    left: -10px;
                                    background: radial-gradient(at 0px 0px, transparent 10px, #fff 10px);
                                }

                            }
                        }
                        main {
                            height: 460px;
                            background-color: #fff;
                            box-shadow: 0 23px 45px 0 rgba(252,201,58,0.3);
                            border-radius: 0 0 10px 10px;
                            padding: 86px 97px 0;
                            form {
                                label {
                                    font-size:20px;
                                    font-weight:400;
                                    color:rgba(102,102,102,1);
                                }
                                .ant-form-item-label {
                                    margin-top: 6px;
                                }
                                .ant-form-item {
                                    margin-bottom: 54px;
                                    button {
                                        width: 100%;
                                        height:60px;
                                        line-height: 60px;
                                        text-align: center;
                                        background:linear-gradient(90deg,rgba(255,222,59,1),rgba(252,201,58,1));
                                        box-shadow:0 20px 38px 0 rgba(255,236,23,0.9);
                                        border-radius:30px;
                                        font-size:20px;
                                        font-weight:400;
                                        color:rgba(51,51,51,1);
                                        border: 0;
                                        margin-top: 38px;
                                    }
                                }
                                .ant-form-item-with-help {
                                    margin-bottom: 18px;
                                }
                                .ant-form-explain {
                                    font-size:16px;
                                    font-weight:400;
                                    color:rgba(255,109,136,1);
                                    margin-top: 12px;
                                }
                                input {
                                    height:54px;
                                    border-radius:8px;
                                    border:2px solid rgba(243,243,243,1);
                                    font-size:24px;
                                    font-weight:400;
                                    color:rgba(51,51,51,1);
                                    padding-left: 20px;
                                }
                                input:hover, input:focus {
                                    border: 2px solid #FFC207;
                                    box-shadow:0 0 8px 0 rgba(255,194,7,0.5);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>