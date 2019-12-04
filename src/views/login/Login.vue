<template>
    <div class="login-container">
        <div class="login-area">
            <div class="title">
                <img src="../../images/title.png" alt="">
            </div>
            <div class="login-box">
                <div class="login">
                    <header>
                        <div :class="{selectedItem: login === 'telephone'}" @click="login = 'telephone'"><span>短信登录</span></div>
                        <div :class="{selectedItem: login === 'account'}" @click="login = 'account'"><span>密码登录</span></div>
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
                            <a-form-item v-show="login === 'account'">
                                <div class="icon" >
                                    <img src="../../images/password.png" alt="">
                                </div>
                                <a-input type="password" placeholder="请输入密码"
                                         v-decorator="[
                                                            'password',
                                                            {rules: [
                                                             { required: true, message: '请输入密码' },
                                                            ]}
                                                          ]"
                                />
                            </a-form-item>
                            <a-form-item v-show="login === 'telephone'">
                                <div class="icon" >
                                    <img src="../../images/keyboard.png" alt="">
                                </div>
                                <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}" placeholder="请输入验证码"
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
                                <span class="forget-password" v-show="login === 'account'" @click="$router.push('/resetPassword')">忘记密码?</span>
                                <a-button
                                        type="primary"
                                        html-type="submit"
                                        size="large"
                                >
                                    登 录
                                </a-button>
                                <div class="register"><span @click="$router.push('/register')">没有账号点击注册!</span></div>
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
    import PuzzleVerification from '@/js/puzzleVerification.min';
    import {constantRouterMap, mode} from '@/router/routerList';
    import VueRouter from 'vue-router'
    export default {
        name: "Login",
        data () {
            return {
                rootUrl: this.$store.state.apiUrl,
                login: 'telephone',
                form: this.$form.createForm(this),
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                timeOut: '',
                verificationShowModal: false,
            }
        },
        components: {
            PuzzleVerification
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
                        return
                        this.loginByVerificationCode(values);
                    });
                }

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

            //验证码登录
            loginByVerificationCode (values) {
                const params = {
                    mobile: values.telephone,
                    code: values.VerificationCode
                };
                this.$axios.get(this.rootUrl + '/indexapp.php?c=CTUser&a=loginByMobile', {params})
                    .then(res => {
                        let data = res.data;
                        // console.log(data);
                        if (data.code === 200) {
                            const info = data.data
                            this.afterLogin(info)
                        } else {
                            this.$message.warning(data.msg,5);
                        }
                    })
                    .catch(() => {

                    })

            },

            //密码登录
            loginByPassword (values) {
                const params = {
                    phone: values.telephone,
                    password: md5(values.password).toLowerCase()
                };
                this.$axios.post(this.rootUrl + '/v1/login/login', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            const info = data.data
                            this.afterLogin(info)
                        }else if (data.code === 403 || data.code === 404){
                            this.$message.warning('用户名或密码错误',5);
                            this.setVerificationWrongCount()
                        }
                    })
                    .catch(() => {

                    })

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

            // 登录成功后执行的操作
            async afterLogin (info) {
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
                const fromRoute = this.$route.query.from;
                if (fromRoute) {
                    this.$router.push(fromRoute);
                }else {
                    this.$router.push('/personalCenter');
                }
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
    .login-container {
        height: 100%;
        min-width: 500px;
        position: relative;
        background: url("../../images/banner.jpg") no-repeat center;
        background-size: cover;
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        .login-area {
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
            .login-box {
                width:417px;
                height:488px;
                background: linear-gradient(0deg,rgba(174,20,255,1) 0%,rgba(59,149,255,1) 100%) no-repeat center;
                border-radius: 20px;
                padding: 10px;
                margin-top: 13px;
            }
            .login {
                height:100%;
                background-color: #fff;
                border-radius: 20px;
                overflow: hidden;
                header {
                    width: 240px;
                    margin: 27px auto 0;
                    height: 40px;
                    display: flex;
                    justify-content: space-between;
                    > div {
                        width: 80px;
                        height: 100%;
                        font-size:20px;
                        color:#B5B5B5;
                        text-align: center;
                        line-height: 40px;
                        cursor: pointer;
                        &.selectedItem {
                            color:#707070;
                            border-bottom: 1px solid #707070;
                        }
                    }
                }
                main {
                    padding: 58px 40px 0;
                    form {
                        .ant-form-item {
                            margin-bottom: 60px;
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
                            .forget-password {
                                position: absolute;
                                bottom: 50px;
                                right: 5px;
                                font-size:12px;
                                color: #999;
                                cursor: pointer;
                                height: 20px;
                                line-height: 20px;
                                transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                                &:hover {
                                    color: @themeColor;
                                }
                            }
                            .register {
                                font-size:12px;
                                color: #999;
                                text-align: center;
                                height: 32px;
                                line-height: 32px;
                                span {
                                    cursor: pointer;
                                    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                                    &:hover {
                                        color: @themeColor;
                                    }
                                }
                            }
                        }
                        .ant-form-item:nth-child(3) {
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
                        /*.ant-form-item-with-help {*/
                        /*    margin-bottom: 45px;*/
                        /*}*/
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
