<template>
    <div class="setting-container">
        <div class="setting-box">
            <h1 class="title">
                <div class="line"></div>
                <span>账户设置</span>
                <span class="logout" @click="logout">退出登录</span>
            </h1>
            <main>
                <div class="info-box">
                    <img :src="userInfo.headimg? resourceUrl + userInfo.headimg: defaultAvatar" alt="">
                    <div class="info">
                        <p class="phone">账号:&nbsp;&nbsp;&nbsp;{{userInfo.phone}}</p>
                        <p class="password"><span>密码:&nbsp;&nbsp;&nbsp;</span><a-button @click="openModifyPasswordModal">修改密码</a-button></p>
                    </div>
                </div>
            </main>
        </div>
        <a-modal
                v-model="showModal"
                :centered="centered"
                class="modifyPasswordModal"
                :closable="closable"
                :maskClosable="closable"
        >
            <template slot="footer">
                <a-button @click="showModal = false">
                    取消
                </a-button>
                <a-button key="submit" type="primary" @click="resetPassword">
                    重置密码
                </a-button>
            </template>
            <h1>重置密码</h1>
            <a-form
                    :form="form"
                    :hideRequiredMark="hideRequiredMark"
            >
                <a-form-item>
                    <a-input size="large" type="number" oninput="if (value.length > 11){value = value.slice(0,11)}"
                             autocomplete="off" placeholder="请输入手机号" disabled
                             v-decorator="[
                                                'telephone',
                                                {
                                                    rules: [
                                                        { required: true, message: '请输入手机号' },
                                                        { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }
                                                    ]
                                                }
                                            ]"
                    />
                </a-form-item>
                <a-form-item>
                    <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}"
                             autocomplete="off" size="large" placeholder="请输入验证码"
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
                <a-form-item>
                    <a-input size="large" placeholder="请输入新密码" type="password"
                             autocomplete="off"
                             v-decorator="[
                                                'password',
                                                {
                                                    rules: [
                                                        { required: true, message: '请输入密码' },
                                                        { min: 6, message: '密码长度不能小于6位' }
                                                    ]
                                                }
                                            ]"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
        <a-modal
                :visible="verificationShowModal"
                @cancel="verificationShowModal = false"
                class="puzzle-verification"
                style="top: 200px;"
                :maskClosable="closable"
        >
            <PuzzleVerification
                    :onSuccess="handleSuccess"
                    blockType="puzzle"
            />
            <span class="close" @click="verificationShowModal = false"><a-icon type="close-circle" /></span>
        </a-modal>
        <VerificationCodeWarningModal :visible="warningModal" :close="closeWarningModal"></VerificationCodeWarningModal>
    </div>
</template>

<script>
    import defaultAvatar from './images/avatar.png';
    import common from '@/api/common';
    import VerificationCodeWarningModal from '@/components/VerificationCodeWarningModal/VerificationCodeWarningModal';
    import PuzzleVerification from '@/js/puzzleVerification.min';
    export default {
        name: "Setting",
        data () {
            return {
                defaultAvatar,
                userInfo: common.getLocalStorage('userInfo'),
                resourceUrl: this.$store.state.resourceUrl + '/',
                showModal: false,
                centered: true,
                closable: false,
                form: this.$form.createForm(this),
                hideRequiredMark: true,
                loading: false,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                timeOut: '',
                rootUrl: this.$store.state.rootUrl,
                warningModal: false,
                verificationShowModal: false,
                permission: true,
            }
        },
        components:{
            VerificationCodeWarningModal,
            PuzzleVerification
        },
        methods:{
            // 打开修改密码弹窗
            openModifyPasswordModal () {
                this.showModal = true;
                this.$nextTick(function () {
                    this.form.setFieldsValue({['telephone']: this.userInfo.phone})
                })
            },

            //修改密码
            resetPassword () {
                this.form.validateFields((err, values) => {
                    if (err) return;
                    if (!this.permission) {
                        return this.setVerificationWrongCount()
                    };
                    this.loading = true;
                    const params = {
                        phone: values.telephone,
                        code: values.VerificationCode,
                        password: values.password
                    };
                    this.$axios.post(this.$store.state.apiUrl + '/v1/login/updatePassword', params)
                        .then(res => {
                            let data = res.data;
                            this.loading = false;
                            if (data.code === 200) {
                                this.$message.success('密码重置成功',5);
                                this.showModal = false;
                                this.form.resetFields(['VerificationCode', 'password'])
                            }else {
                                this.$message.warning(data.msg,5);
                                this.setVerificationWrongCount()
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        })
                });
            },

            //发送验证码
            sendVerificationCode () {
                this.form.validateFields(['telephone'], (err, values) => {
                    if (err) return;
                    if (this.alreadyGetCode || this.timeOut) return;
                    this.setVerificationWrongCount();
                    if (!this.permission) return;
                    const params = {
                        phone: values.telephone,
                    };
                    this.$axios.post( this.rootUrl + '/v1/message/sendSMSCode', params)
                        .then(res => {
                            let data = res.data;
                            if (data.code === 200) {
                                //倒计时60s
                                let oneMinute = 60;
                                this.verificationCodeText = `重新获取(${oneMinute}s)`;
                                this.alreadyGetCode = true;
                                this.timeOut = setInterval(() => {
                                    if (oneMinute <= 0) {
                                        this.alreadyGetCode = false;
                                        this.verificationCodeText = '重新获取';
                                        clearInterval(this.timeOut);
                                        this.timeOut = false;
                                    } else {
                                        oneMinute --;
                                        this.verificationCodeText = `重新获取(${oneMinute}s)`;
                                    }

                                }, 1000);
                            }else if (data.code === 403) {
                                this.warningModal = true;
                            }else {
                                this.$message.warning(data.msg, 5);
                            }
                        })
                        .catch(() => {

                        })

                });
            },

            // 退出登录
            logout () {
                localStorage.removeItem('token')
                if (this.$route.path !== '/home') {
                    this.$router.push('/login')
                } else {
                    this.$store.commit('setIdentity', '')
                }
            },

            // 设置验证错误次数
            setVerificationWrongCount () {
                let verificationWrongCount = common.getLocalStorage('verificationWrongCount') || 0;
                verificationWrongCount ++;
                if (verificationWrongCount >= 4) {
                    this.verificationShowModal = true;
                    this.permission = false;
                }
                common.setLocalStorage('verificationWrongCount', verificationWrongCount)
            },

            handleSuccess () {
                this.verificationShowModal = false;
                this.permission = true;
                common.setLocalStorage('verificationWrongCount', 0);
            },

            // 关闭验证码警告框
            closeWarningModal () {
                this.warningModal = false;
            }
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
    .setting-container {
        .setting-box {
            background:rgba(255,255,255,1);
            border-radius:6px;
            overflow: hidden;
            > .title {
                height: 60px;
                border-bottom: 1px solid #F4F5F7;
                padding: 0 23px 0 17px;
                font-size:18px;
                font-weight:normal;
                color:rgba(67,67,67,1);
                margin-bottom: 0;
                span {
                    line-height: 60px;
                    vertical-align: top;
                }
                .line {
                    display: inline-block;
                    width:4px;
                    height:30px;
                    background:@themeColor;
                    border-radius:2px;
                    margin: 15px 10px 0 0;
                    vertical-align: top;
                }
                .logout {
                    font-size: 16px;
                    color: @themeColor;
                    float: right;
                    cursor: pointer;
                }
            }
            main {
                background-color: #fff;
                min-height: 640px;
                position: relative;
                padding: 26px 32px;
                .info-box {
                    height: 90px;
                    img {
                        width: 90px;
                        float: left;
                        vertical-align: top;
                        margin-right: 30px;
                    }
                    .info {
                        float: left;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-evenly;
                        p {
                            margin: 0;
                            font-size: 16px;
                            color: #434343;
                            &.password {
                               button {
                                   width:96px;
                                   height:30px;
                                   border:1px solid @themeColor;
                                   color: @themeColor;
                                   border-radius:10px;
                                   &:hover {
                                       color: #fff;
                                       background-color: @themeColor;
                                   }
                               }
                            }
                        }
                    }
                }
            }
        }
    }
    .modifyPasswordModal {
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        width:345px !important;
        height:390px !important;
        padding: 0;
        border-radius: 10px;
        overflow: hidden;

        .ant-form-item-with-help {
            margin-bottom: 0;
        }
        .ant-modal-content {
            background: #fff;
            box-shadow: unset;
            height: 100%;
            .ant-modal-header {
                border: 0;
                background-color: unset;
                div {
                    font-size:28px;
                    text-align: center;
                    font-weight:500;
                    color:rgba(51,51,51,1);
                }
            }
            .ant-modal-body {
                padding: 35px 40px;
                position: relative;

                .anticon-close-circle {
                    position: absolute;
                    right: -15px;
                    top: 0;
                    font-size: 30px;
                    color: #fff;
                    cursor: pointer;
                }
                > h1 {
                    font-size: 20px;
                    text-align: center;
                    font-weight: normal;
                    margin-bottom: 30px;
                    .color {
                        color: @themeColor;
                    }
                }

                .ant-form-item {
                    height: 70px;
                    margin-bottom: 0;
                    &:last-of-type {
                        height: 38px;
                    }
                }

                .ant-form-item-control {
                    input {
                        border: 1px solid #CDCDCD;
                        border-radius: 10px;
                        color: rgba(0, 0, 0, .85);
                        font-size: 14px;
                        height: 38px;
                        padding-left: 15px;
                        line-height: 38px;
                        &:focus {
                            box-shadow: unset;
                        }
                        &::-webkit-input-placeholder { /* WebKit browsers */
                            color:#D2D2D2;
                        }
                        &:-webkit-autofill {
                            box-shadow: 0 0 0 100px #fff inset !important;
                            color:#D2D2D2 !important;
                        }
                    }
                    .ant-form-explain {
                        font-size:12px;
                        font-weight:400;
                        color:rgba(255,109,136,1);
                        margin-top: 0;
                        margin-left: 15px;
                    }
                    .getVerificationCode {
                        user-select: none;
                        position: absolute;
                        right: 18px;
                        top: 0;
                        color:@themeColor;
                        cursor: pointer;
                        line-height: 1.5;
                        &.alreadyGetCode {
                            color: #999;
                        }
                    }
                }
            }
        }
        .ant-modal-footer {
            user-select: none;
            border: 0;
            text-align: center;
            padding-top: 5px;
            font-size: 0;
            button {
                width:110px;
                height:40px;
                border-radius:6px;
                font-size:18px;
                &:last-of-type {
                    margin-left: 40px;
                }
            }
        }
    }
</style>
