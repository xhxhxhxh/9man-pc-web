<template>
    <div class="login-container">
        <div class="banner">
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
                        <a-form-item v-show="login === 'account'">
                            <div class="icon" >
                                <img src="./images/password.png" alt="">
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
                                <img src="./images/keyboard.png" alt="">
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
                            <span class="forget-password" v-show="login === 'account'">忘记密码?</span>
                            <a-button
                                    type="primary"
                                    html-type="submit"
                                    size="large"
                            >
                                登 录
                            </a-button>
                            <div class="register"><span>没有账号点击注册!</span></div>
                        </a-form-item>
                    </a-form>
                </main>
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
                login: 'telephone',
                form: this.$form.createForm(this),
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                timeOut: '',
                rootUrl: this.$store.state.rootUrl,
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
                        return
                        this.loginByVerificationCode(values);
                    });
                }

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
                            common.setLocalStorage('id', data.info.id);
                            common.setLocalStorage('userInfo', data.info);
                            this.$store.commit('setIdentity', data.info.identity);
                            this.$store.commit('updateUserInfo');
                            this.$store.commit('updateUsername');
                            this.$router.addRoutes([this.$store.getters.roles,{path: '*', redirect: '/404'}]);
                            this.$router.go(-1);
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
                this.$axios.post(this.$store.state.apiUrl + '/v1/login/login', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            const info = data.data
                            common.setLocalStorage('token', info.token);
                            common.setLocalStorage('userInfo', info.data);
                            this.$store.commit('setIdentity', info.data.identity);
                            this.$store.commit('updateUserInfo');
                            this.$store.commit('updateUsername');
                            // this.$router.addRoutes([this.$store.getters.roles, {path: '*', redirect: '/404'}]);
                            this.$router.go(-1);
                        }else{
                            this.$message.warning('用户名或密码错误',5);
                        }
                    })
                    .catch(() => {

                    })

            },
        }
    }
</script>

<style lang="less">
    .login-container {
        height: 100%;
        min-width: 500px;
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
            .login {
                width:368px;
                height:463px;
                margin: 121px auto 0;
                background: url("images/login-bgc.png") no-repeat center;
                background-size: cover;
                padding-top: 60px;
                header {
                    width: 270px;
                    margin: 0 auto;
                    height: 50px;
                    > div {
                        width: 50%;
                        height: 100%;
                        font-size:20px;
                        color:#D2D2D2;
                        text-align: center;
                        line-height: 50px;
                        cursor: pointer;
                        float: left;
                        &.selectedItem {
                            color:#999;
                        }
                    }
                }
                main {
                    padding: 20px 45px 0;
                    form {
                        .ant-form-item {
                            margin-bottom: 45px;
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
                                    color: #FCC93A;
                                }
                            }
                            .register {
                                font-size:12px;
                                color: #999;
                                text-align: center;
                                height: 36px;
                                line-height: 36px;
                                span {
                                    cursor: pointer;
                                    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                                    &:hover {
                                        color: #FCC93A;
                                    }
                                }
                            }
                        }
                        .ant-form-item:nth-child(3) {
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
                        /*.ant-form-item-with-help {*/
                        /*    margin-bottom: 45px;*/
                        /*}*/
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
                        }
                    }
                }
            }
        }
    }
</style>
