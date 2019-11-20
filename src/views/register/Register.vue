<template>
    <div class="register-container">
        <div class="banner">
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
                                <img src="./images/phone.png" alt="">
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
                                <img src="./images/keyboard.png" alt="">
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
                                <img src="./images/password.png" alt="">
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
                                <img src="./images/kid.png" alt="">
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
                        console.log(data)
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
            afterRegister (info) {
                common.setLocalStorage('token', info.token);
                common.setLocalStorage('userInfo', info.data);
                common.setLocalStorage('verificationWrongCount', 0);
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
            }
        }
    }
</script>

<style lang="less">
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
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        .banner {
            height: 100%;
            background: url("images/banner.png") no-repeat center;
            background-size: cover;
            overflow: hidden;
            .register {
                width:368px;
                height:465px;
                margin: 121px auto 0;
                background: url("images/register-bgc.png") no-repeat center;
                background-size: cover;
                padding-top: 40px;
                header {
                    width: 100%;
                    margin: 0 auto;
                    height: 50px;
                    color:#999;
                    font-size:20px;
                    text-align: center;
                    line-height: 50px;
                }
                main {
                    padding: 0 45px 0;
                    form {
                        .ant-form-item {
                            margin-bottom: 13px;
                            position: relative;
                            height: 45px;
                            .icon {
                                display: inline-block;
                                width: 30px;
                                height: 28px;
                                vertical-align: bottom;
                                img {
                                    display: block;
                                    vertical-align: bottom;
                                    margin: 0 auto;
                                }
                            }
                            button {
                                width: 100%;
                                height:40px;
                                line-height: 40px;
                                text-align: center;
                                background-color: #FED45C;
                                border-radius:6px;
                                font-size:20px;
                                color:#fefefe;
                                border: 0;
                                margin-top: 10px;
                                &:hover {
                                    background-color: #FCC93A;
                                }
                            }
                            .login {
                                font-size:12px;
                                color: #999;
                                height: 36px;
                                line-height: 36px;
                                text-align: center;
                                span {
                                    cursor: pointer;
                                    color: #FCC93A;
                                }
                            }
                        }
                        .ant-form-item:nth-child(2) {
                            .getVerificationCode {
                                position: absolute;
                                right: 11px;
                                top: 50%;
                                transform: translate(0, -20%);
                                color:#999;
                                cursor: pointer;
                                width: 70px;
                                text-align: center;
                                height: 20px;
                                line-height: 20px;
                                transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                                &.alreadyGetCode {
                                    color: #333;
                                }
                                &:hover {
                                    color: #FCC93A;
                                }
                            }
                        }

                        .ant-form-explain {
                            font-size:12px;
                            font-weight:400;
                            color:rgba(255,109,136,1);
                            margin-top: 4px;
                            margin-left: 42px;
                        }
                        input {
                            border: 0 !important;
                            box-shadow: unset !important;
                            border-radius: unset;
                            height:32px;
                            width: 240px;
                            border-bottom:2px solid #FED45C !important;
                            font-size:18px;
                            color:rgba(51,51,51,1);
                            padding-left: 5px;
                            margin-left: 8px;
                            vertical-align: bottom;
                            &:-webkit-autofill {
                                box-shadow: 0 0 0 100px white inset !important;
                                color:rgba(51,51,51,1) !important;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
