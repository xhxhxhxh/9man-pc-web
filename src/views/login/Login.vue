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
                                        :wrapper-col="{ span: 18, offset: 1 }"
                                >
                                    <a-input size="large" type="number" oninput="if (value.length > 11){value = value.slice(0,11)}"
                                             autocomplete="off"
                                            v-decorator="[
                                                            'telephone',
                                                            {
                                                                rules: [
                                                                            { required: true, message: '请输入正确的手机号' },
                                                                            { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }
                                                                        ]
                                                            }
                                                          ]"
                                    />
                                </a-form-item>
                                <a-form-item
                                        label="密码"
                                        :label-col="{ span: 5 }"
                                        :wrapper-col="{ span: 18, offset: 1 }"
                                        v-show="login == 'account'"
                                >
                                    <a-input type="password"
                                            v-decorator="[
                                                            'password',
                                                            {rules: [
                                                             { required: true, message: '请输入密码' },
                                                            { pattern: /^[0-9a-zA-Z]{6,}$/, message: '长度不能小于6位,不能有特殊字符和空格' }
                                                            ]}
                                                          ]"
                                    />
                                </a-form-item>
                                <a-form-item
                                        label="验证码"
                                        :label-col="{ span: 5 }"
                                        :wrapper-col="{ span: 18, offset: 1 }"
                                        v-show="login == 'telephone'"
                                >
                                    <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}"
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
    import md5 from 'blueimp-md5';
    import common from '@/api/common';
    export default {
        name: "Login",
        data () {
            return {
                login: 'account',
                form: this.$form.createForm(this),
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                timeOut: '',
            }
        },
        created () {
            this.$store.commit('setIdentity', '') // 清除identity
        },
        methods: {
            //登录
            handleSubmit (e) {
                e.preventDefault();
                if (this.login === 'account') {
                    this.form.validateFields(['telephone', 'password'], (err, values) => {
                        if (err) return;
                        this.loginByPassword(values);
                    });

                } else if (this.login === 'telephone') {
                    this.form.validateFields(['telephone', 'VerificationCode'], (err, values) => {
                        if (err) return;
                        this.loginByVerificationCode(values);
                    });
                }

            },

            //发送验证码
            sendVerificationCode () {
                this.form.validateFields(['telephone'], (err, values) => {
                    if (err) return;
                    if (this.alreadyGetCode) return;
                    const params = {
                        mobile: values.telephone,
                        type: 0
                    };
                    this.$axios.get( '/indexapp.php?c=sendMessage&a=sendSms', {params})
                        .then(res => {
                            let data = res.data;
                            this.$message.success('验证码发送成功',5);
                            if (data.code == 200) {
                                //倒计时60s
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

                });


            },

            //验证码登录
            loginByVerificationCode (values) {
                const params = {
                    mobile: values.telephone,
                    code: values.VerificationCode
                };
                this.$axios.get('/indexapp.php?c=CTUser&a=loginByMobile', {params})
                    .then(res => {
                        let data = res.data;
                        // console.log(data);
                        if (data.code == 200) {
                            common.setLocalStorage('id', data.info.id);
                            common.setLocalStorage('userInfo', data.info);
                            this.$store.commit('setIdentity', data.info.identity);
                            this.$router.addRoutes([this.$store.getters.roles]);
                            this.$router.go(-1);
                        } else {
                            this.$message.warning(data.msg,5);
                        }
                    })
                    .catch(err => {

                    })

            },

            //密码登录
            loginByPassword (values) {
                const params = {
                    mobile: values.telephone,
                    password: md5(values.password).toLowerCase()
                };
                this.$axios.get('/indexapp.php?c=CTUser&a=loginMobile', {params})
                    .then(res => {
                        let data = res.data;
                        // console.log(data);
                        if (data.code == 200) {
                            common.setLocalStorage('id', data.info.id);
                            common.setLocalStorage('userInfo', data.info);
                            this.$store.commit('setIdentity', data.info.identity);
                            this.$router.addRoutes([this.$store.getters.roles]);
                            this.$router.go(-1);
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
    .login-container {
        nput::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        .banner {
            height: 541px;
            background: url("images/banner.png") no-repeat center;
            background-size: cover;
            padding: 110px 39px 0 46px;
            .bannerInfo {
                height: 600px;
                background: url("images/banner-info.png") no-repeat center;
                background-size: contain;
                position: relative;
                .login {
                    width:500px;
                    height:460px;
                    position: absolute;
                    top: 100px;
                    right: 381px;
                    .loginItem {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        width: 100%;
                        header {
                            height: 71px;
                            > div {
                                width: 50%;
                                height: 100%;
                                padding: 0 30px;
                                font-size:18px;
                                color:#999;
                                text-align: center;
                                line-height: 71px;
                                background:rgba(255,255,255,.5);
                                float: left;
                                cursor: pointer;
                                position: relative;
                                &.selectedItem {
                                    height: 103px;
                                    line-height: 103px;
                                    background: #fff;
                                    font-size:24px;
                                    font-weight:400;
                                    color:rgba(255,146,6,1);
                                    transform: translate(0, -22px);
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
                            height: 365px;
                            background-color: #fff;
                            box-shadow: 0 23px 45px 0 rgba(252,201,58,0.3);
                            border-radius: 0 0 10px 10px;
                            padding: 55px 80px 0;
                            form {
                                label {
                                    font-size:16px;
                                    font-weight:400;
                                    color:rgba(102,102,102,1);
                                }
                                .ant-form-item-label {
                                    margin-top: 2.5px;
                                }
                                .ant-form-item {
                                    margin-bottom: 45px;
                                    position: relative;
                                    height: 45px;
                                    button {
                                        width: 100%;
                                        height:50px;
                                        line-height: 50px;
                                        text-align: center;
                                        background:linear-gradient(90deg,rgba(255,222,59,1),rgba(252,201,58,1));
                                        box-shadow:0 20px 38px 0 rgba(255,236,23,0.9);
                                        border-radius:30px;
                                        font-size:16px;
                                        font-weight:400;
                                        color:rgba(51,51,51,1);
                                        border: 0;
                                        margin-top: 20px;
                                    }
                                }
                                .ant-form-item:nth-child(3) {
                                    .getVerificationCode {
                                        position: absolute;
                                        right: 11px;
                                        top: 50%;
                                        transform: translate(0, -60%);
                                        color:rgba(74,189,255,1);
                                        cursor: pointer;
                                        width: 70px;
                                        text-align: center;
                                        &.alreadyGetCode {
                                            color: #333;
                                        }
                                    }
                                }
                                /*.ant-form-item-with-help {*/
                                /*    margin-bottom: 45px;*/
                                /*}*/
                                .ant-form-explain {
                                    font-size:12px;
                                    font-weight:400;
                                    color:rgba(255,109,136,1);
                                    margin-top: 8px;
                                }
                                input {
                                    height:45px;
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
