<template>
    <div class="register-container">
        <div class="register-area">
            <div class="title">
                <img src="../../images/title.png" alt="">
            </div>
            <div class="register-box">
                <div class="register">
                    <header>
                        <span>账号注册</span>
                    </header>
                    <main>
                        <a-form
                                :form="form"
                                @submit="handleSubmit"
                                :hideRequiredMark="hideRequiredMark"
                        >
                            <a-form-item>
                                <div class="icon" >
                                    <img src="../../images/phone.png" alt="">
                                </div>
                                <a-input size="large" type="number" oninput="if (value.length > 11){value = value.slice(0,11)}"
                                         autocomplete="off" placeholder="请输入手机号"
                                         v-decorator="[
                                                            'telephone',
                                                            {
                                                                rules: [
                                                                            { required: true, message: '请输入手机号' },
                                                                            { pattern: /^1\d{10}$/, message: '手机号输入错误，请重新输入' }
                                                                        ]
                                                            }
                                                          ]"
                                />
                            </a-form-item>
                            <a-form-item>
                                <div class="icon">
                                    <img src="../../images/keyboard.png" alt="">
                                </div>
                                <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}" placeholder="请输入验证码"
                                         v-decorator="[
                                                            'VerificationCode',
                                                            {rules: [

                                                            { pattern: /^\d{6}$/, message: '验证码错误' }
                                                            ]}
                                                          ]"
                                />
                                <span :class="{getVerificationCode: true, alreadyGetCode}" @click="sendVerificationCode">{{verificationCodeText}}</span>
                            </a-form-item>
                            <a-form-item>
                                <div class="icon" >
                                    <img src="../../images/password.png" alt="">
                                </div>
                                <a-input type="password" placeholder="请输入新密码"
                                         v-decorator="[
                                                            'password',
                                                            {rules: [
                                                             { required: true, message: '请输入新密码' },
                                                            ]}
                                                          ]"
                                />
                            </a-form-item>
                            <a-form-item>
                                <div class="icon" >
                                    <img src="../../images/kid.png" alt="">
                                </div>
                                <a-input placeholder="请输入孩子姓名"
                                         v-decorator="['name', {rules: [
                                                             { required: true, message: '请输入孩子姓名' },
                                                            ]}]"
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
                                    注册并登录
                                </a-button>
                                <div class="login">
                                    <p>已有账号? <span @click="$router.push('/login')">马上登录</span></p>
                                </div>
                            </a-form-item>
                        </a-form>
                    </main>
                </div>
            </div>
        </div>
        <a-modal
                :visible="verificationShowModal"
                @cancel="verificationShowModal = false"
                class="puzzle-verification"
                style="top: 200px;"
        >
            <PuzzleVerification
                    :onSuccess="handleSuccess"
                    blockType="puzzle"
            />
            <span class="close" @click="verificationShowModal = false"><a-icon type="close-circle" /></span>
        </a-modal>

    </div>
</template>

<script>
    import md5 from 'blueimp-md5';
    import common from '@/api/common';
    import PuzzleVerification from 'vue-puzzle-verification';
    import {constantRouterMap, mode} from '@/router/routerList';
    import VueRouter from 'vue-router'
    export default {
        name: "Login",
        data () {
            return {
                form: this.$form.createForm(this),
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                timeOut: '',
                rootUrl: this.$store.state.apiUrl,
                verificationShowModal: false,
            }
        },
        components: {
            PuzzleVerification
        },
        created () {

        },
        methods: {
            //注册
            handleSubmit (e) {
                e.preventDefault();
                this.form.validateFields((err, values) => {
                    if (err) return;
                    this.register(values);
                });

            },

            handleSuccess () {
                this.verificationShowModal = false;
                common.setLocalStorage('verificationWrongCount', 0);
            },

            //发送验证码
            sendVerificationCode () {
                this.form.validateFields(['telephone'], (err, values) => {
                    if (err) return;
                    if (this.alreadyGetCode) return;
                    return
                    const params = {
                        mobile: values.telephone,
                        type: 0
                    };
                    this.$axios.get( this.rootUrl + '/indexapp.php?c=sendMessage&a=sendSms', {params})
                        .then(res => {
                            let data = res.data;
                            if (data.code === 200) {
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
                                        this.verificationCodeText = `重新发送(${oneMinute})`;
                                        oneMinute --;
                                    }

                                }, 1000);
                            }
                        })
                        .catch(() => {

                        })

                });
            },

            //注册
            register (values) {
                const params = {
                    phone: values.telephone,
                    password: md5(values.password).toLowerCase(),
                    uname: values.name,
                    platform: 'web'
                };
                this.$axios.post(this.rootUrl + '/v1/login/register', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            const info = data.data
                            this.afterRegister(info)
                            this.$message.success('注册成功',5);
                        }else {
                            this.$message.warning(data.msg,5);
                        }
                    })
                    .catch(() => {

                    })

            },

            // 注册成功后执行的操作
            async afterRegister (info) {
                common.setLocalStorage('token', info.token);
                common.setLocalStorage('userInfo', info.data);
                common.setLocalStorage('verificationWrongCount', 0);
                await this.queryChild()
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            const result = data.data.data;
                            this.$store.commit('setKidsInfo', result);
                            common.setLocalStorage('kidsInfo', result);
                        }
                    })
                    .catch(() => {

                    })
                this.$store.commit('setIdentity', info.data.identity);
                this.$store.commit('updateUserInfo');
                this.$store.commit('updateUsername');
                const router = new VueRouter ({
                    mode,
                    routes: constantRouterMap,
                });
                this.$router.matcher = router.matcher; // 重置路由
                const roles = this.$store.getters.roles;
                this.$router.addRoutes(roles);
                this.$router.push('/personalCenter');
            },

            // 设置验证错误次数
            setVerificationWrongCount () {
                let verificationWrongCount = common.getLocalStorage('verificationWrongCount') || 0;
                verificationWrongCount ++;
                if (verificationWrongCount >= 4) {
                    this.verificationShowModal = true
                }
                common.setLocalStorage('verificationWrongCount', verificationWrongCount)
            },

            // 查询孩子
            queryChild () {
                return this.$axios.get(this.rootUrl + '/v1/child/queryChild')
            },
        }
    }
</script>

<style lang="less">
    @import "../../less/index.less";
    .puzzle-verification {
        width: 292px !important;
        border-radius: 16px;
        overflow: hidden;
        padding-bottom: 0;
        .ant-modal-content {
            .ant-modal-close {
                display: none;
            }
            .ant-modal-body {
                padding: 0;
                .close {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    position: absolute;
                    right: 16px;
                    top: 23px;
                    z-index: 999;
                    background-color: #fff;
                    line-height: 20px;
                    text-align: center;
                    &:hover {
                        color: #f5222d;
                    }
                }
                .puzzle-container {
                    display: inline-block !important;
                }
            }
            .ant-modal-footer {
                display: none;
            }
        }
    }
    .register-container {
        height: 100%;
        min-width: 500px;
        position: relative;
        background: url("../../images/banner.png") no-repeat center;
        background-size: cover;
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        .register-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -60%);
            overflow: hidden;
            .title {
                img {
                    width: 274px;
                    display: block;
                    margin: 0 auto;
                }
            }
            .register-box {
                width:417px;
                height:488px;
                background: linear-gradient(0deg,rgba(174,20,255,1) 0%,rgba(59,149,255,1) 100%) no-repeat center;
                border-radius: 20px;
                padding: 10px;
                margin-top: 13px;
            }
            .register {
                height:100%;
                background-color: #fff;
                border-radius: 20px;
                overflow: hidden;
                header {
                    width: 100%;
                    margin: 22px auto 5px;
                    height: 50px;
                    color:#707070;
                    font-size:20px;
                    text-align: center;
                    line-height: 50px;
                }
                main {
                    padding: 0 40px 0;
                    form {
                        .ant-form-item {
                            margin-bottom: 20px;
                            position: relative;
                            height: 50px;
                            background:rgba(238,238,238,1);
                            border-radius:20px;
                            &:last-of-type {
                                background: unset;
                            }
                            .icon {
                                display: inline-block;
                                width: 30px;
                                height: 28px;
                                vertical-align: bottom;
                                margin-left: 20px;
                                img {
                                    display: block;
                                    vertical-align: bottom;
                                    margin: 0 auto;
                                }
                            }
                            button {
                                width: 100%;
                                height:50px;
                                line-height: 50px;
                                text-align: center;
                                border-radius:20px;
                                font-size:20px;
                                color:#fefefe;
                                border: 0;
                            }
                            .login {
                                font-size:12px;
                                color: #999;
                                height: 32px;
                                line-height: 32px;
                                text-align: center;
                                span {
                                    cursor: pointer;
                                    color: @themeColor;
                                }
                            }
                        }
                        .ant-form-item:nth-child(2) {
                            .getVerificationCode {
                                width:84px;
                                height:36px;
                                background:rgba(248,84,21,1);
                                border-radius:18px;
                                position: absolute;
                                right: -11px;
                                top: 50%;
                                transform: translate(0, -33%);
                                color:#fff;
                                cursor: pointer;
                                text-align: center;
                                line-height: 36px;
                                font-size: 12px;
                                &.alreadyGetCode {
                                    color: #333;
                                }

                            }
                        }

                        .ant-form-explain {
                            font-size:12px;
                            font-weight:400;
                            color:rgba(255,109,136,1);
                            margin-top: 11px;
                            margin-left: 42px;
                        }
                        input {
                            border: 0 !important;
                            box-shadow: unset !important;
                            border-radius: unset;
                            height:32px;
                            width: 240px;
                            background-color: unset;
                            font-size:16px;
                            color:rgba(0, 0, 0, .85);
                            padding-left: 5px;
                            margin-left: 8px;
                            vertical-align: bottom;
                            &::-webkit-input-placeholder { /* WebKit browsers */
                                color:#B5B5B5;
                            }
                            &:-webkit-autofill {
                                box-shadow: 0 0 0 100px #EEEEEE inset !important;
                                color:#B5B5B5 !important;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
