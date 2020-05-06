<template>
    <div class="home-container">
        <TopBar></TopBar>
        <div class="banner">
            <main class="clearfix">
                <div class="signUp">
                    <h2>立即领取</h2>
                    <h3>免费获得价值<span>299元</span>体验课</h3>
                    <a-form
                            :form="form"
                            :hideRequiredMark="hideRequiredMark"
                    >
                        <a-form-item>
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
                        <a-form-item v-show="showGetCodeInput">
                            <a-input type="number" oninput="if (value.length > 6){value = value.slice(0,6)}" placeholder="请输入验证码"
                                     v-decorator="[
                                                            'VerificationCode',
                                                            {rules: [
                                                             { required: true, message: '请输入验证码' },
                                                            { pattern: /^\d{6}$/, message: '验证码错误' }
                                                            ]}
                                                          ]"
                            />
                        </a-form-item>
                    </a-form>
                    <span :class="{getVerificationCode: true, alreadyGetCode}" @click="sendVerificationCode">{{verificationCodeText}}</span>
                    <a-button
                            type="primary"
                            size="large"
                    >
                        立即领取
                    </a-button>
                </div>
            </main>
        </div>
        <div class="home-body">
            <div class="iceberg">
                <main>
                    <h1>少儿教育的“冰山”</h1>
                    <div class="image">
                        <img src="/assets/iceberg.png" alt="">
                    </div>
                </main>
            </div>
            <div class="enlighten">
                <main>
                    <h1>三大学科 综合启蒙</h1>
                    <div class="image">
                        <img src="/assets/enlighten.png" alt="">
                    </div>
                </main>
            </div>
            <div class="realization">
                <main>
                    <h1>PYP课程 培养国际意识</h1>
                </main>
            </div>
            <div class="features">
                <main>
                    <h1>四大课程特色 让孩子爱上学习</h1>
                    <div class="image">
                        <img src="/assets/features.png" alt="">
                    </div>
                </main>
            </div>
            <div class="reason">
                <main>
                    <h1>为什么要在少儿思维学习</h1>
                    <div class="img-box">
                        <div class="img-item">
                            <div class="wrapper">
                                <div class="text">
                                    <div class="line f_left"></div>
                                    <p class="f_right">
                                        <span>先进教育理念</span>
                                        <br>
                                        <span>激发自主学习潜能</span>
                                    </p>
                                </div>
                            </div>
                            <img :src="webp? '/assets/reason1.webp': '/assets/reason1.png'" alt="">
                        </div>
                        <div class="img-item">
                            <div class="wrapper">
                                <div class="text">
                                    <div class="line f_left"></div>
                                    <p class="f_right">
                                        <span>品质课程设计</span>
                                        <br>
                                        <span>构建学科交叉融合</span>
                                    </p>
                                </div>
                            </div>
                            <img :src="webp? '/assets/reason2.webp': '/assets/reason2.png'" alt="">
                        </div>
                        <div class="img-item">
                            <div class="wrapper">
                                <div class="text">
                                    <div class="line f_left"></div>
                                    <p class="f_right">
                                        <span>资深教研团队</span>
                                        <br>
                                        <span>爱孩子懂教育</span>
                                    </p>
                                </div>
                            </div>
                            <img :src="webp? '/assets/reason3.webp': '/assets/reason3.png'" alt="">
                        </div>
                        <div class="img-item">
                            <div class="wrapper">
                                <div class="text">
                                    <div class="line f_left"></div>
                                    <p class="f_right">
                                        <span>小班课堂教学</span>
                                        <br>
                                        <span>专属课堂在线学习</span>
                                    </p>
                                </div>
                            </div>
                            <img :src="webp? '/assets/reason4.webp': '/assets/reason4.png'" alt="">
                        </div>
                        <div class="img-item">
                            <div class="wrapper">
                                <div class="text">
                                    <div class="line f_left"></div>
                                    <p class="f_right">
                                        <span>专属教学软件</span>
                                        <br>
                                        <span>动画游戏寓教于乐</span>
                                    </p>
                                </div>
                            </div>
                            <img :src="webp? '/assets/reason5.webp': '/assets/reason5.png'" alt="">
                        </div>
                        <div class="img-item">
                            <div class="wrapper">
                                <div class="text">
                                    <div class="line f_left"></div>
                                    <p class="f_right">
                                        <span>定制课程教具</span>
                                        <br>
                                        <span>学习效果显而易见</span>
                                    </p>
                                </div>
                            </div>
                            <img :src="webp? '/assets/reason6.webp': '/assets/reason6.png'" alt="">
                        </div>
                    </div>
                </main>
            </div>
            <div class="experience">
                <main>
                    <h1>简单三步即可开启课程体验</h1>
                    <div class="three-step">
                        <div class="step1">
                            <div class="num">1</div>
                            <h3>网上注册</h3>
                            <p>完成注册，免费领取<br>价值299元试听课程</p>
                            <a-button type="primary">立即领取</a-button>
                        </div>
                        <div class="step2">
                            <div class="num">2</div>
                            <h3>专属预约</h3>
                            <p>专属课程顾问对接<br>为您的孩子安排课程时间</p>
                            <a-button type="primary" @click="contact = true">联系老师</a-button>
                        </div>
                        <div class="step3">
                            <div class="num">3</div>
                            <h3>开始课程</h3>
                            <p>下载并开启设备<br>开启探索学习之旅</p>
                            <a-button type="primary" @click="download = true">软件下载</a-button>
                        </div>
                    </div>
                </main>
            </div>
            <div class="promise">
                <main>
                    <h1>九漫教育郑重承诺</h1>
                    <div class="promise-box">
                       <div class="image f_left">
                           <img :src="webp? '/assets/teacher.webp': '/assets/teacher.png'" alt="">
                       </div>
                        <div class="promise-three f_right">
                            <div class="promise1">
                                <div class="title">
                                    <span class="icon"><img src="./images/teachers.png" alt=""></span>
                                    <span>专业师资</span>
                                </div>
                                <div class="content">先进的教学理念，我们保证老师的专业教学水平</div>
                            </div>
                            <div class="promise2">
                                <div class="title">
                                    <span class="icon"><img src="./images/examine.png" alt=""></span>
                                    <span>严格考核</span>
                                </div>
                                <div class="content">统一培训，集中备课，安排试讲。层层筛选，保证老师的教学质量</div>
                            </div>
                            <div class="promise3">
                                <div class="title">
                                    <span class="icon"><img src="./images/vip.png" alt=""></span>
                                    <span>VIP服务</span>
                                </div>
                                <div class="content">专属课程助理一对一贴心陪伴，学习需求实时响应，学习效果全程跟进</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <div class="carefully-selected">
                <main>
                    <h1>教师严格筛选 层层把关</h1>
                    <div class="image">
                        <img :src="webp? '/assets/carefully-selected.webp': '/assets/carefully-selected.png'" alt="">
                    </div>
                    <div :class="{'trial-lesson-receive': true, fixed: showBottomNav, unfixed: hiddenBottomNav}">
                        <div class="trial-lesson-receive-box">
                            <div class="dog">
                                <img src="./images/dog.png" alt="">
                            </div>
                            <div class="text">
                                <h3>免费领取价值<span>299元</span>试听课</h3>
                            </div>
                            <div class="receive">
                                <a-input-search size="large" placeholder="请输入手机号" @search="openApplyModal" v-model="phone"
                                                type="number" oninput="if (value.length > 11){value = value.slice(0,11)}">
                                    <a-button slot="enterButton" type="primary">立即领取</a-button>
                                </a-input-search>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
        <div class="home-foot">
            <main class="clearFix">
                <div class="base-info">
                    <div class="nav clearFix f_left">
                        <dl>
                            <dt>
                                <span class="icon"><img src="./images/home.png" alt=""></span>
                                <span>首页精选</span>
                            </dt>
                            <dd>
                                <span>返回首页</span>
                            </dd>
                        </dl>
                        <dl>
                            <dt>
                                <span class="icon"><img src="./images/about.png" alt=""></span>
                                <span>关于我们</span>
                            </dt>
                            <dd>
                                <span>产品介绍</span>
                            </dd>
                            <dd>
                                <span>功能特色</span>
                            </dd>
                            <dd>
                                <router-link to="/agreements/privacyPolicy">《隐私政策》</router-link>
                            </dd>
                            <dd>
                                <router-link to="/agreements/agreement">《用户服务协议》</router-link>
                            </dd>
                        </dl>
                        <dl>
                            <dt>
                                <span class="icon"><img src="./images/telephone.png" alt=""></span>
                                <span>联系我们</span>
                            </dt>
                            <dd>
                                <span>公司地址</span>
                            </dd>
                            <dd>
                                <span>线上联系</span>
                            </dd>
                        </dl>
                    </div>
                    <div class="QR-code f_left clearFix">
                        <div class="code1 f_left">
                            <img src="./images/qr-code.jpg" alt="">
                            <p>下载全优在线App</p>
                        </div>
                        <div class="code2 f_left">
                            <img src="./images/qr-code.jpg" alt="">
                            <p>微信公众号</p>
                        </div>
                    </div>
                    <div class="contact f_right">
                        <div class="phone">
                            <p><img src="./images/telephone.png" alt=""><span>客服电话:</span></p>
                            <p>0571-28815085</p>
                        </div>
                        <div class="qq">
                            <p><img src="./images/qq.png" alt=""><span>QQ:</span></p>
                            <p>17454075</p>
                        </div>
                    </div>
                </div>

            </main>
            <div class="website-info">
                <div class="website-info-box">
                    <p>杭州九漫信息技术有限公司版权所有-<a href="http://beian.miit.gov.cn" target="_blank">浙ICP备09095240号</a>-3</p>
                </div>
            </div>
        </div>
        <transition name="slide">
            <div class="apply">
                <a-button class="button1" @click="apply = true"><img src="./images/headset.png" alt=""><span>现在试听</span></a-button>
                <a-button class="button2" @click="contact = true"><img src="./images/message.png" alt=""><span>联系老师</span></a-button>
                <a-button class="button3" @click="download = true"><img src="./images/download.png" alt=""><span>软件下载</span></a-button>
            </div>
        </transition>
        <div class="scroll-top" v-show="toTop" @click="smoothScroll">
            <img src="./images/totop.png" alt="">
        </div>

        <a-modal
                v-model="apply"
                :centered="centered"
                class="homeModal"
                :closable="closable"
                :maskClosable="closable"
        >
            <template slot="footer">
                <a-button key="submit" type="primary" :loading="loading" @click="handleApply">
                    领取体验课
                </a-button>
            </template>
            <a-icon type="close-circle" @click="apply = false"/>
            <h1><span>免费获取价值</span><span class="color">299元</span><span>体验课</span></h1>
            <a-form
                    :form="form2"
                    :hideRequiredMark="hideRequiredMark"
            >
                <a-form-item>
                    <a-input size="large" type="number" oninput="if (value.length > 11){value = value.slice(0,11)}"
                             autocomplete="off" placeholder="请输入手机号"
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
                    <span :class="{getVerificationCode: true, alreadyGetCode}" @click="sendVerificationCodeInModal">{{verificationCodeText}}</span>
                </a-form-item>
                <a-form-item>
                    <a-input size="large" placeholder="请输入孩子姓名"
                             autocomplete="off"
                             v-decorator="[
                                                'username',
                                                {
                                                    rules: [
                                                        { required: true, message: '请输入姓名' },
                                                        { min: 2, max: 20, message: '姓名不正确' }
                                                    ]
                                                }
                                            ]"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
        <a-modal
                v-model="contact"
                :centered="centered"
                class="contactModal"
                width="580"
                :footer="null"
                :maskClosable="closable">
            <main>
                <div class="wx box">
                    <div class="header">微信二维码</div>
                    <div class="body">
                        <img src="./images/wx-code.png" alt="">
                    </div>
                </div>
                <div class="phone box">
                    <div class="header">联系电话</div>
                    <div class="body">
                        <p class="twenty-four-hour"><img src="./images/phone.png" alt="">24h电话：</p>
                        <p>15558067572</p>
                    </div>
                </div>
            </main>
        </a-modal>
        <a-modal
                v-model="download"
                :centered="centered"
                class="downloadModal"
                width="580"
                :footer="null"
                :maskClosable="closable">
            <main>
                <div class="computer box">
                    <div class="left"><p>电脑上课</p></div>
                    <div class="right">
                        <img src="./images/chrome.png" alt="">
                        <div class="content">
                            <p class="content">Google Chrome浏览器</p>
                            <a-button type="primary" @click="skipChromeSite">谷歌浏览器下载</a-button>
                        </div>
                    </div>
                </div>
                <div class="phone box">
                    <div class="left"><p>手机上课</p></div>
                    <div class="right">
                        <div class="code1">
                            <img src="./images/android-download.png" alt="">
                            <p>(安卓手机)</p>
                        </div>
                        <div class="code2">
                            <img src="./images/ios-download.png" alt="">
                            <p>(苹果手机)</p>
                        </div>
                    </div>
                </div>
                <div class="ipad box">
                    <div class="left"><p style="width: 40px">ipad</p><p>上课</p></div>
                    <div class="right">
                        <div class="code">
                            <img src="./images/ios-download.png" alt="">
                            <p>(ipad)</p>
                        </div>
                    </div>
                </div>
            </main>
        </a-modal>
    </div>
</template>

<script>
    import webpSupport from '@/api/webpSupport';
    import TopBar from '@/components/TopBar/TopBar';
    export default {
        name: "Home",
        data () {
            return {
                showMessage: '',
                showIdea: 'knowledge',
                showGetCodeInput: false, // 显示获取验证码输入框
                show: false,
                apply: false,
                contact: false,
                download: false,
                loading: false,
                centered: true, //报名弹框居中
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                form: this.$form.createForm(this),
                form2: this.$form.createForm(this),
                timeOut: '',
                rootUrl: this.$store.state.rootUrl,
                webp: false,
                showApply: false, // 显示右侧导航
                showBottomNav: false, // 显示底部导航
                hiddenBottomNav: true,
                toTop: false, // 显示回到顶部
                closable: false,
                phone: ''
            }
        },
        components: {
            TopBar
        },
        created () {
            this.webp = webpSupport();
        },
        mounted () {
            this.windowOnScroll()
        },
        methods: {
            //提交报名
            handleApply () {
                this.form2.validateFields((err, values) => {
                    if (err) return;
                    this.loading = true;
                    const params = {
                        mobile: values.telephone,
                        code: values.VerificationCode,
                        uname: values.username,
                        password: values.password
                    };
                    return
                    this.$axios.get(this.rootUrl + '/indexapp.php?c=CTUser&a=AddCTEnroll', {params})
                        .then(res => {
                            let data = res.data;
                            if (data.code == 200) {
                                this.$message.success('报名成功',5);
                                this.apply = false;
                            } else {
                                this.$message.warning(data.msg,5);
                            }
                            this.loading = false;
                        })
                        .catch(err => {
                            this.loading = false;
                        })
                });
            },

            //发送验证码(banner栏)
            sendVerificationCode () {
                this.form.validateFields(['telephone'], (err, values) => {
                    if (err) return;
                    if (this.alreadyGetCode) return;
                    const params = {
                        mobile: values.telephone,
                        type: 0
                    };
                    this.showGetCodeInput = true;
                    return
                    this.$axios.get(this.rootUrl + '/indexapp.php?c=sendMessage&a=sendSms', {params})
                        .then(res => {
                            let data = res.data;
                            if (data.code === 200) {
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

                });


            },

            //发送验证码(modal)
            sendVerificationCodeInModal () {
                this.form2.validateFields(['telephone'], (err, values) => {
                    if (err) return;
                    if (this.alreadyGetCode) return;
                    const params = {
                        mobile: values.telephone,
                        type: 0
                    };
                    return
                    this.$axios.get(this.rootUrl + '/indexapp.php?c=sendMessage&a=sendSms', {params})
                        .then(res => {
                            let data = res.data;
                            if (data.code === 200) {
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

                });


            },

            // 监听页面滚动
            windowOnScroll () {
                const _this = this
                window.onscroll = function () {
                    const top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                    if (top >= 500) {
                        if (!_this.showApply) {
                            _this.showApply = true
                        }
                        if (_this.hiddenBottomNav) {
                            _this.hiddenBottomNav = false
                        }
                        if (!_this.showBottomNav) {
                            _this.showBottomNav = true
                        }
                        if (!_this.toTop) {
                            _this.toTop = true
                        }
                    }else {
                        if (_this.showApply) {
                            _this.showApply = false
                        }
                        if (!_this.hiddenBottomNav) {
                            _this.hiddenBottomNav = true
                        }
                        if (_this.showBottomNav) {
                            _this.showBottomNav = false
                        }
                        if (_this.toTop) {
                            _this.toTop = false
                        }

                    }

                    if (top >= 6750) {
                        if (_this.showApply) {
                            _this.showApply = false
                        }
                        if (_this.hiddenBottomNav) {
                            _this.hiddenBottomNav = false
                        }
                        if (_this.showBottomNav) {
                            _this.showBottomNav = false
                        }
                    }

                }
            },

            // 打开报名弹窗
            openApplyModal () {
                this.apply = true;
                this.$nextTick(function () {
                    this.form2.setFieldsValue({['telephone']: this.phone});
                })
            },

            // 回到顶部
            smoothScroll(){
                const top = document.documentElement.scrollTop;
                const timer = setInterval(function(){
                    const speed = Math.floor(-top / 80);
                    document.documentElement.scrollTop += speed;
                    if(document.documentElement.scrollTop <= 0){
                        clearInterval(timer);
                    }
                },5)
            },

            // 前往谷歌浏览器页面
            skipChromeSite () {
                window.open('https://www.google.cn/chrome/')
            },
        }
    }
</script>

<style lang="less">
    @import "../../less/index.less";
    .home-container {
        padding-top: 70px;
        min-width: 1100px;
        .slide-enter-active, .slide-leave-active {
            transition: all .5s;
        }
        .slide-enter, .slide-leave-to {
            transform: translate(100%, 0);
        }
        @keyframes slideIn {
            from {
                bottom: -174px;
            }
        }
        @media (max-width: 1280px) {
            .scroll-top {
                bottom: 100px !important;
            }
        }
        .scroll-top {
            width: 64px;
            height: 64px;
            position: fixed;
            bottom: 0;
            right: 0;
            line-height: 64px;
            background-color: rgba(0, 0, 0, .6);
            z-index: 999;
            cursor: pointer;
            text-align: center;
            img {
                vertical-align: middle;
            }
        }
        .apply {
            width:160px;
            height:220px;
            position: fixed;
            right: 0;
            bottom: 50%;
            transform: translate(0, 50%);
            z-index: 999;
            button {
                width: 100%;
                height: 60px;
                border-radius: 30px 0 0 30px;
                font-size: 18px;
                color: #fff;
                border: 0;
                margin-bottom: 20px;
                padding-left: 28px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                &.button1 {
                    background-color: #FEB05C;
                }
                &.button2 {
                    background-color: #FE5C5C;
                }
                &.button3 {
                    background-color: #5CC3FE;
                }
            }

        }
        .banner {
            height: 600px;
            background: url("./images/banner.png") no-repeat center bottom;
            background-size: cover;

            main {
                width: 1100px;
                height: 100%;
                margin: 0 auto;
                position: relative;

                .signUp {
                    input::-webkit-outer-spin-button,
                    input::-webkit-inner-spin-button{
                        -webkit-appearance: none !important;
                    }
                    input[type="number"]{
                        -moz-appearance:textfield;
                    }
                    width: 365px;
                    background: rgba(255, 255, 255, .7);
                    border-radius: 20px;
                    position: absolute;
                    left: 0;
                    top: 260px;
                    padding: 14px 35px 50px;

                    h2 {
                        font-size: 24px;
                        font-weight: bold;
                        color: #312C2C;
                        text-align: center;
                        margin-bottom: 0;
                    }

                    h3 {
                        font-size: 18px;
                        color: #312C2C;
                        text-align: center;
                        margin-bottom: 17px;

                        span {
                            color: @themeColor;
                            font-size: 24px;
                        }
                    }
                    .ant-form-item {
                        margin-bottom: 26px;
                        height:44px;
                        .ant-form-explain {
                            font-size:12px;
                            font-weight:400;
                            color:rgba(255,109,136,1);
                            margin-top: 4px;
                            margin-left: 20px;
                        }
                    }
                    input {
                        height:44px;
                        border-radius:20px;
                        border: 0;
                        padding-left: 20px;
                        color: rgba(0, 0, 0, .85);
                        font-size: 16px;
                        &::-webkit-input-placeholder { /* WebKit browsers */
                            color:#808080;
                        }
                        &:-webkit-autofill {
                            box-shadow: 0 0 0 100px #fff inset !important;
                            color:#808080 !important;
                        }
                    }
                    .getVerificationCode {
                        user-select: none;
                        position: absolute;
                        cursor: pointer;
                        right: 47px;
                        top: 110px;
                        width:91px;
                        height:31px;
                        background:rgba(229,229,229,1);
                        border-radius:16px;
                        color: @themeColor;
                        text-align: center;
                        line-height: 31px;
                    }

                    button {
                        width: 100%;
                        height: 44px;
                        border-radius: 20px;
                        font-size: 18px;
                    }
                }
            }
        }
        .home-body {
            main {
                width: 1100px;
                height: 100%;
                margin: 0 auto;
                overflow: hidden;

                h1 {
                    font-size: 47px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 0;
                }
            }
            .iceberg {
                height: 1000px;
                h1 {
                    margin-top: 88px;
                    color: #312C2C;
                    margin-bottom: 72px;
                }
                .image {
                    img {
                        width: 100%;
                        display: block;
                        margin: 0 auto;
                    }
                }
            }
            .enlighten {
                height: 1084px;
                h1 {
                    margin-top: 88px;
                    color: #312C2C;
                    margin-bottom: 72px;
                }
                .image {
                    img {
                        width: 100%;
                        display: block;
                        margin: 0 auto;
                    }
                }
            }
            .realization {
                height: 929px;
                background: url("./images/realization.png") no-repeat center;
                h1 {
                    margin-top: 90px;
                    color: #fff;
                }
            }
            .features {
                height: 547px;
                h1 {
                    margin-top: 88px;
                    color: #312C2C;
                    margin-bottom: 75px;
                }
                .image {
                    img {
                        display: block;
                        margin: 0 auto;
                    }
                }
            }
            .reason {
                height: 958px;
                background-color: #FAFAFC;
                h1 {
                    margin-top: 96px;
                    color: #312C2C;
                }
                .img-box {
                    margin-top: 67px;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    .img-item {
                        position: relative;
                        margin-bottom: 28px;
                        border-radius:20px;
                        overflow: hidden;
                        &:hover {
                            .text {
                                display: none;
                            }
                            img {
                                transform: scale(1.2);
                            }
                        }
                        img {
                            transition: all .5s;
                        }
                        .wrapper {
                            width: 100%;
                            position: absolute;
                            z-index: 9;
                            height: 100%;
                            background:linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,-0.52));
                            .text {
                                position: absolute;
                                top: 25px;
                                left: 25px;
                                color: #fff;
                                transition: all .5s;
                                .line {
                                    width:10px;
                                    height:60px;
                                    background:@themeColor;
                                    border-radius:5px;
                                    margin-right: 10px;
                                }
                                span:first-of-type {
                                    font-size:22px;
                                    font-weight:bold;
                                }
                                span:last-of-type {
                                    font-size:18px;
                                }
                            }
                        }
                    }
                    img {
                        vertical-align: top;
                    }
                }
            }
            .experience {
                height: 712px;
                h1 {
                    margin-top: 86px;
                    color: #312C2C;
                }
                .three-step {
                    margin-top: 80px;
                    display: flex;
                    justify-content: space-between;
                    > div {
                        width:340px;
                        height:380px;
                        background:rgba(255,255,255,1);
                        border:4px solid rgba(228,228,228,1);
                        border-radius:20px;
                        padding: 50px 20px 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        .num {
                            width:96px;
                            height:96px;
                            border-radius:50%;
                            font-size: 55px;
                            text-align: center;
                            line-height: 88px;
                            color: #fff;
                            background-clip: content-box;
                        }
                        h3 {
                            font-weight: normal;
                            color: #373333;
                            font-size: 22px;
                            text-align: center;
                        }
                        p {
                            font-size:16px;
                            color:rgba(128,128,128,1);
                            text-align: center;
                        }
                        button {
                            height:50px;
                            font-size: 22px;
                            border-radius:20px;
                            width: 100%;
                        }
                        &.step1 {
                            .num {
                                background-color:rgba(254,176,92,1);
                                border: 4px solid rgba(254,176,92,.3);
                            }

                        }
                        &.step2 {
                            .num {
                                background-color:rgba(254,92,92,1);
                                border: 4px solid rgba(254,92,92,.3);
                            }

                        }
                        &.step3 {
                            .num {
                                background-color:rgba(92,195,254,1);
                                border: 4px solid rgba(92,195,254,.3);
                            }

                        }
                    }

                }
            }
            .promise {
                height: 753px;
                background-color: #333333;
                h1 {
                    margin-top: 74px;
                    color: #fff;
                }
                .promise-box {
                    margin-top: 65px;
                    .promise-three {
                        > div {
                            margin-bottom: 24px;
                            .title {
                                height: 62px;
                                vertical-align: bottom;
                                font-size:22px;
                                color:rgba(255,255,255,1);
                                margin-bottom: 15px;
                                .icon {
                                    margin-right: 18px;
                                }
                            }
                            .content {
                                color: #D2D2D2;
                                font-size: 18px;
                                padding-left: 86px;
                                width: 500px;
                            }
                        }
                    }
                }
            }
            .carefully-selected {
                height: 1098px;
                main {
                    width: 100%;
                    margin: 0;
                    position: relative;
                }
                h1 {
                    margin-top: 71px;
                    color: #312C2C;
                }
                .image {
                    margin-top: 24px;
                    position: relative;
                    overflow: hidden;
                    height: 653px;
                    img {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translate(-50%, 0);
                    }
                }
                @media (max-width: 1280px) {
                    .trial-lesson-receive {
                        .trial-lesson-receive-box {
                            min-width: 900px !important;
                            width: 100% !important;
                        }
                    }
                }
                .trial-lesson-receive {
                    width: 100%;
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    height: 64px;
                    background-color: rgba(0,0,0,.6);
                    &.fixed {
                        position: fixed;
                        animation: slideIn .5s ease;
                        animation-fill-mode: forwards;
                    }
                    &.unfixed {
                        position: fixed;
                        transform: translate(0, 174px);
                        transition: all .5s;
                    }

                    .trial-lesson-receive-box {
                        width: 1100px;
                        margin: 0 auto;
                        position: relative;
                        height: 100%;
                    }
                    .dog {
                        position: absolute;
                        left: 83px;
                        bottom: 0;
                    }
                    .text {
                        display: inline-block;
                        margin-left: 284px;
                        h3 {
                            font-size: 22px;
                            color: #fff;
                            margin: 0;
                            height: 100%;
                            line-height: 60px;
                            span {
                                color: #FFB300;
                                font-size: 32px;
                            }
                        }
                    }
                    .receive {
                        float: right;
                        margin-top: 9px;
                        input::-webkit-outer-spin-button,
                        input::-webkit-inner-spin-button{
                            -webkit-appearance: none !important;
                        }
                        input[type="number"]{
                            -moz-appearance:textfield;
                        }
                        .ant-input {
                            height: 46px;
                            width: 210px;
                            border-radius: 23px 0 0 23px;
                            padding-left: 23px;
                            color: rgba(0, 0, 0, .85);
                            font-size: 16px;
                            &::-webkit-input-placeholder { /* WebKit browsers */
                                color:#808080;
                            }
                        }
                        .ant-input-group-addon {
                            border-radius: 0 23px 23px 0;
                            background-color: unset;
                            .ant-btn {
                                height: 46px;
                                width: 110px;
                                font-size: 16px;
                                border-radius: 0 23px 23px 0;
                            }
                        }

                    }
                }
            }
        }
        .home-foot {
            background-color: #2D2D2D;
            main {
                width: 1100px;
                margin: 0 auto;
                padding-top: 37px;
                .base-info {
                    .nav {
                        > dl {
                            float: left;
                            color: #fff;
                            margin-right: 66px;
                            dt {
                                vertical-align: middle;
                                font-size: 14px;
                                margin-bottom: 18px;
                                .icon {
                                    margin-right: 3px;
                                }
                            }
                            dd {
                                font-size: 12px;
                                color: #cccccc;
                                padding-left: 28px;
                                margin-bottom: 20px;
                                cursor: pointer;
                                &:hover {
                                    color: @themeColor;
                                }
                                a {
                                    color: #cccccc;
                                    &:hover {
                                        color: @themeColor;
                                    }
                                }
                            }
                        }
                    }
                    .QR-code {
                        margin-left: 54px;
                        .code1 {
                            margin-right: 80px;
                        }
                        img {
                            width: 108px;
                        }
                        p {
                            margin-top: 10px;
                            font-size: 14px;
                            color: #fff;
                            text-align: center;
                        }
                    }
                    .contact {
                        color: #fff;
                        > div {
                            img {
                                margin-right: 3px;
                            }
                            p:last-of-type {
                                font-size: 24px;
                                margin-bottom: 20px;
                            }
                        }
                    }
                }
            }
            .website-info {
                height: 87px;
                border-top: 1px solid #4f4e4e;
                .website-info-box {
                    height: 100%;
                    width: 1100px;
                    margin: 0 auto;
                    p {
                        color: #ccc;
                        margin: 0;
                        line-height: 86px;
                        a {
                            color: #ccc;
                            &:hover {
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
        }
    }
    .homeModal {
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        width:458px !important;
        height:526px !important;
        padding: 0;

        .ant-form-item-with-help {
            margin-bottom: 0;
        }
        .ant-modal-content {
            background: url("./images/modal-bgc.png");
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
                padding-top: 150px;
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
                    font-size: 27px;
                    text-align: center;
                    font-weight: normal;
                    margin-bottom: 14px;
                    .color {
                        color: @themeColor;
                    }
                }
                > form {
                    padding: 0 57px;
                }

                .ant-form-item {
                    height: 70px;
                    margin-bottom: 0;
                    &:last-of-type {
                        height: 48px;
                    }
                }

                .ant-form-item-control {
                    input {
                        border: 1px solid #B5B5B5;
                        border-radius: 20px;
                        color: rgba(0, 0, 0, .85);
                        font-size: 14px;
                        height: 48px;
                        padding-left: 20px;
                        line-height: 48px;
                        &:focus {
                            box-shadow: unset;
                        }
                        &::-webkit-input-placeholder { /* WebKit browsers */
                            color:#898989;
                        }
                        &:-webkit-autofill {
                            box-shadow: 0 0 0 100px #fff inset !important;
                            color:#898989 !important;
                        }
                    }
                    .ant-form-explain {
                        font-size:12px;
                        font-weight:400;
                        color:rgba(255,109,136,1);
                        margin-top: 0;
                        margin-left: 20px;
                    }
                    .getVerificationCode {
                        user-select: none;
                        width:100px;
                        height:34px;
                        line-height: 34px;
                        background:@themeColor;
                        position: absolute;
                        right: 12px;
                        top: -7px;
                        color:#fff;
                        cursor: pointer;
                        text-align: center;
                        border-radius:17px;
                        &.alreadyGetCode {
                            color: #333;
                        }
                    }
                }
            }
        }
        .ant-modal-footer {
            border: 0;
            text-align: center;
            padding-top: 2px;
            button {
                width:200px;
                height:46px;
                border-radius:20px;
                font-size:16px;
                color: #fff;
            }
        }
    }
    .contactModal {
        width:580px;
        .ant-modal-body {
            padding: 0;
        }
        main {
            display: flex;
            justify-content: space-evenly;
            height:430px;
            border-radius:10px;
            padding-top: 84px;
            .box {
                width:230px;
                &.wx .header{
                    background:linear-gradient(90deg,rgba(255,70,244,1),rgba(160,59,255,1));
                }
                &.phone {
                    .header {
                        background:linear-gradient(90deg,rgba(255,181,70,1),rgba(255,81,59,1));
                    }
                    .body {
                        flex-direction: column;
                        p {
                            font-size: 16px;
                            color: #312C2C;
                            margin-bottom: 6px;
                            &.twenty-four-hour {
                                display: flex;
                                align-items: center;
                                img {
                                    width: 18px;
                                    display: inline-block;
                                }
                            }
                        }
                    }
                }
                .header {
                    height:60px;
                    border-radius:10px 10px 0 0;
                    line-height: 60px;
                    text-align: center;
                    font-size: 20px;
                    color: #fff;
                }
                .body {
                    height: 192px;
                    background-color: #EBEBEB;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    img {
                        width: 152px;
                        display: block;
                    }
                }
            }
        }
    }
    .downloadModal {
        width: 580px;
        .ant-modal-body {
            padding: 0;
        }
        main {
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            height:600px;
            border-radius:10px;
            padding: 55px 72px 36px;
            .box {
                height:150px;
                &.computer {
                    .left {
                        background:linear-gradient(0deg,rgba(255,70,244,1),rgba(160,59,255,1));
                    }
                    .right {
                        img {
                            width: 56px;
                            float: left;
                        }
                        .content {
                            text-align: center;
                            float: left;
                            width: 220px;
                            p {
                                height: 56px;
                                font-size:20px;
                                color: #514E4E;
                                margin-bottom: 0;
                                line-height: 56px;
                            }
                            button {
                                margin-top: 4px;
                                width:162px;
                                height:42px;
                                border-radius:21px;
                            }
                        }
                    }
                }
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
                    width: 375px;
                    height: 100%;
                    background-color: #EBEBEB;
                    float: left;
                    border-radius:0 10px 10px 0;
                    padding: 24px 44px;
                }
            }
        }
    }
</style>
