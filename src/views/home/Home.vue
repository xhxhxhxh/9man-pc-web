<template>
    <div class="home-container">
        <div class="banner">
            <main>
                <h1 class="title">
                    <p>在线少儿思维启蒙直播课</p>
                    <div class="subtitle">
                        <div>
                            <span class="circle"></span><span class="content">交互模式</span>
                        </div>
                        <div>
                            <span class="circle"></span><span class="content">趣味学习</span>
                        </div>
                        <div>
                            <span class="circle"></span><span class="content">优质团队</span>
                        </div>
                    </div>
                </h1>
                <div class="signUp">
                    <h2>试听课领取</h2>
                    <h3>价值<span>188</span>元的精品试听课</h3>
                    <img src="./images/messge.png" alt="">
                    <a-button
                            type="primary"
                            size="large"
                            @click="apply = true"
                    >
                        立即领取
                    </a-button>
                </div>
                <img src="./images/table.png" alt="" class="table">
            </main>
        </div>
        <div class="education">
            <main>
                <h1>六级教学体系</h1>
                <img src="./images/education.png" alt="">
            </main>
        </div>
        <div class="special">
            <main>
                <h1>教学特色</h1>
                <div class="specialBox">
                    <div class="specialItem">
                        <h3>科学知识</h3>
                        <p>简单易懂的基础科学原理，神奇有趣，带孩子体验不一样的世界。</p>
                    </div>
                    <div class="specialItem">
                        <h3>基本常识</h3>
                        <p>安全意识、环保意识、文明礼貌、独立 自主......点点滴滴，潜移默化成长路上常相伴。</p>
                    </div>
                    <div class="specialItem">
                        <h3>生活百科</h3>
                        <p>生活是很好玩儿的，生活百科，给孩子发现美的眼睛，让孩子不泯童心。</p>
                    </div>
                </div>
            </main>
        </div>
        <div class="ability">
            <main>
                <h1>能力培养</h1>
                <div class="mind">
                    <div class="image">
                        <img src="./images/ability.png" alt="">
                        <span class="create-circle" @mouseenter="showMessage = 'create'" @mouseleave="showMessage = ''"></span>
                        <span class="logic-circle" @mouseenter="showMessage = 'logic'" @mouseleave="showMessage = ''"></span>
                        <span class="practical-circle" @mouseenter="showMessage = 'practical'" @mouseleave="showMessage = ''"></span>
                        <span class="personal-circle" @mouseenter="showMessage = 'personal'" @mouseleave="showMessage = ''"></span>
                        <span class="personality-circle" @mouseenter="showMessage = 'personality'" @mouseleave="showMessage = ''"></span>
                    </div>
                    <div :class="{create: true, showMessage: showMessage === 'create'}">
                        <p>创造思维是一种新颖而有价值的、非结论的，具有高度机动性和坚持性，且能清楚地勾划和 解决问题的思维活动。</p>
                    </div>
                    <div :class="{logic: true, showMessage: showMessage === 'logic'}">
                        <p>逻辑思维是指将思维内容联结、组织在一起的方式或形式。是人的一种认知结构，又是人运用范畴、概念去把握客体的能力结构。</p>
                    </div>
                    <div :class="{practical: true, showMessage: showMessage === 'practical'}">
                        <p>获取知识<br>分享和行动教授给别人<br>获得反馈或者卡顿儿，重新学习<br>和丰富讲课内容</p>
                    </div>
                    <div :class="{personal: true, showMessage: showMessage === 'personal'}">
                        <p>在知识经济时代，个人能力是非常重要的，因为知识总是在更新，只有不断学习才能跟上时代的步伐。</p>
                    </div>
                    <div :class="{personality: true, showMessage: showMessage === 'personality'}">
                        <p>人格和素质，是这个世界上最坚固的基石，最可靠的依,赖是不能够用任何物质来取代的。</p>
                    </div>
                </div>
            </main>
        </div>
        <div class="idea">
            <main>
                <h1>教学理念</h1>
                <div class="ideaBox">
                    <div class="centerCircle">
                       <transition name="myFade" tag="div" mode="out-in">
                           <p v-if="showIdea === 'knowledge'" key="1">一切行动的根源不过是“ 我想知道......”激发孩子的兴趣，让求知的过程不在枯燥乏味</p>
                           <p v-if="showIdea === 'inspire'" key="2">站在“巨人”的肩膀上看世界资深教师带领孩子玩转数学世界</p>
                           <p v-if="showIdea === 'explore'" key="3">百变的场景，生动的情节，奇妙的构思来吧，去探索，把一切未知变成已知</p>
                           <p v-if="showIdea === 'innovation'" key="4">多领域学科知识融合，尽显数学魅力带领孩子多角度观察，让他们每一个想法都闪闪发光,用心记录孩子成长足迹</p>
                       </transition>
                    </div>
                    <div @mouseenter="showIdea = 'knowledge'" :class="{knowledge: true, shadow: showIdea == 'knowledge'}"><p>求知</p></div>
                    <div @mouseenter="showIdea = 'inspire'" :class="{inspire: true, shadow: showIdea == 'inspire'}"><p>启发</p></div>
                    <div @mouseenter="showIdea = 'explore'" :class="{explore: true, shadow: showIdea == 'explore'}"><p>探索</p></div>
                    <div @mouseenter="showIdea = 'innovation'" :class="{innovation: true, shadow: showIdea == 'innovation'}"><p>创新</p></div>
                </div>
            </main>

        </div>
        <div class="ourSpecial">
            <main>
                <h1>我们的特色</h1>
                <img src="./images/idea.png" alt="">
            </main>
        </div>
        <div class="apply" @click="apply = true">
            <span>试听报名</span>
            <img src="./images/Audition.png" alt="">
        </div>
        <a-modal
                v-model="apply"
                title="试听报名"
                :centered="centered"
                class="homeModal"
        >
            <template slot="footer">
                <a-button key="submit" type="primary" :loading="loading" @click="handleApply">
                    立即报名
                </a-button>
            </template>
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
                        label="姓名:"
                        :label-col="{ span: 4 }"
                        :wrapper-col="{ span: 19, offset: 1 }"
                        :colon="colon"
                >
                    <a-input size="large"
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
                <a-form-item
                        label="密码:"
                        :label-col="{ span: 4 }"
                        :wrapper-col="{ span: 19, offset: 1 }"
                        :colon="colon"
                >
                    <a-input type="password" size="large"
                             v-decorator="[
                                             'password',
                                             {rules: [
                                              { required: true, message: '请输入密码' },
                                             { pattern: /^[0-9a-zA-Z]{6,}$/, message: '长度不能小于6位,不能有特殊字符和空格' }
                                             ]}
                                           ]"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script>
    export default {
        name: "Home",
        data () {
            return {
                showMessage: '',
                showIdea: 'knowledge',
                show: false,
                apply: false,
                loading: false,
                centered: true, //报名弹框居中
                hideRequiredMark: true,
                verificationCodeText: '获取验证码',
                alreadyGetCode: false,
                form: this.$form.createForm(this),
                colon: false,  //label中的冒号
                timeOut: '',
            }
        },
        methods: {
            //提交报名
            handleApply () {
                this.form.validateFields((err, values) => {
                    if (err) return;
                    this.loading = true;
                    const params = {
                        mobile: values.telephone,
                        code: values.VerificationCode,
                        uname: values.username,
                        password: values.password
                    };
                    this.$axios.get('/indexapp.php?c=CTUser&a=AddCTEnroll', {params})
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

                });


            },
        }
    }
</script>

<style lang="less">
    .home-container {
        .myFade-enter-active, .myFade-leave-active {
            transition: all .5s;
        }
        .myFade-enter, .myFade-leave-to {
            opacity: 0;
        }
        .apply {
            width:80px;
            height:220px;
            background:rgba(252,201,58,1);
            box-shadow:0 20px 60px 0 rgba(252,201,58,0.6);
            border-radius:40px;
            position: fixed;
            right: 80px;
            bottom: 80px;
            padding: 28px;
            line-height: 1.15;
            cursor: pointer;
            span {
                font-size:24px;
                color:rgba(254,254,254,1);
            }
            img {
                position: absolute;
                left: 50%;
                bottom: 20px;
                transform: translate(-50%, 0);
                width: 42px;
                height: 40px;
            }
        }
        .banner {
            height: 570px;
            background-color: #FFD57F;

            main {
                width: 1080px;
                height: 100%;
                margin: 0 auto;
                overflow: hidden;
                position: relative;

                .table {
                    position: absolute;
                    width: 321px;
                    height: 393px;
                    bottom: 55px;
                    right: 41px;
                }

                .title {
                    margin-top: 51px;
                    color: #fff;

                    p {
                        margin-bottom: 0;
                        font-size: 56px;
                        font-weight: 500;
                        color: rgba(255, 255, 255, 1);
                    }

                    .subtitle {
                        height: 50px;
                        margin-top: 2px;

                        > div {
                            width: 177px;
                            line-height: 50px;
                            float: left;
                            height: 100%;

                            .circle {
                                display: inline-block;
                                width: 18px;
                                height: 18px;
                                background-color: #fff;
                                border-radius: 50%;
                                margin-right: 22px;
                            }

                            .content {
                                font-size: 24px;

                            }
                        }
                    }
                }

                .signUp {
                    width: 390px;
                    height: 260px;
                    background: rgba(255, 255, 255, .7);
                    border-radius: 20px;
                    position: absolute;
                    left: 0;
                    bottom: 64px;
                    padding: 14px 52px 0;

                    h2 {
                        font-size: 30px;
                        font-weight: 500;
                        color: rgba(51, 51, 51, 1);
                        text-align: center;
                        margin-bottom: 3px;
                    }

                    h3 {
                        font-size: 18px;
                        color: rgba(102, 102, 102, 1);
                        text-align: center;
                        margin-bottom: 7px;

                        span {
                            color: #FF315D;
                            font-size: 24px;
                        }
                    }

                    img {
                        width: 100%;
                    }

                    button {
                        width: 100%;
                        height: 38px;
                        border-radius: 19px;
                        font-size: 16px;
                        font-weight: 500;
                        color: rgba(51, 51, 51, 1);
                        margin-top: 20px;
                    }
                }
            }
        }

        .education {
            height: 1121px;

            main {
                width: 1080px;
                height: 100%;
                margin: 0 auto;
                overflow: hidden;

                h1 {
                    font-size: 58px;
                    font-weight: bold;
                    color: rgba(51, 51, 51, 1);
                    text-align: center;
                    margin-top: 109px;
                }

                img {
                    width: 100%;
                    margin-top: 55px;
                }
            }
        }

        .special {
            height: 760px;
            background-color: #F7FAFC;

            main {
                width: 1080px;
                height: 100%;
                margin: 0 auto;
                padding-top: 69px;
            }

            h1 {
                font-size: 58px;
                font-weight: bold;
                color: rgba(51, 51, 51, 1);
                text-align: center;
            }

            .specialBox {
                height: 420px;
                margin-top: 84px;
                .specialItem {
                    float: left;
                    width: 360px;
                    height: 100%;
                    background: rgba(255, 255, 255, .5);
                    padding: 79px 54px;
                    border-radius:20px;
                    transition: all .5s;
                    &:hover {
                        box-shadow:0 0 30px 0 rgba(64,78,112,0.2);
                        background-color: #fff;
                    }
                    h3 {
                        font-size: 30px;
                        font-weight: 500;
                        color: rgba(252, 201, 58, 1);
                        text-align: center;
                        margin-bottom: 144px;
                    }
                    p {
                        font-size:16px;
                        color:rgba(51,51,51,1);
                    }
                }
            }
        }
        .ability {
            height: 1031px;
            main {
                width: 1080px;
                height: 100%;
                margin: 0 auto;
                padding-top: 101px;
                h1 {
                    font-size: 58px;
                    font-weight: bold;
                    color: rgba(51, 51, 51, 1);
                    text-align: center;
                    margin-bottom: 50px;
                }
                .mind {
                    height: 692px;
                    position: relative;
                    .image {
                        width: 534px;
                        height: 539px;
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        img {
                            width: 100%;
                            height: 100%;
                        }
                        span {
                            display: block;
                            width: 100px;
                            height: 100px;
                            position: absolute;
                            border-radius: 50%;
                            cursor: pointer;
                        }
                        .create-circle {
                            top: 66px;
                            left: 55px;
                        }
                        .logic-circle {
                            top: 36px;
                            right: 124px;
                        }
                        .practical-circle {
                            bottom: 110px;
                            left: 37px;
                        }
                        .personal-circle {
                            bottom: 183px;
                            right: 37px;
                        }
                        .personality-circle {
                            bottom: 36px;
                            right: 171px;
                        }
                    }
                    > div + div {
                        padding: 35px;
                        box-shadow:0 0 20px 0 rgba(64,78,112,0.16);
                        border-radius:10px;
                        position: absolute;
                        opacity: 0;
                        transition: all .5s;
                        &.showMessage {
                            opacity: 1;
                        }
                        p {
                            font-size:14px;
                            color: #333333;
                            margin-bottom: 0;
                        }
                    }
                    .create {
                        width: 350px;
                        top: 0;
                        left: 0;
                    }
                    .logic {
                        width: 340px;
                        top: 0;
                        right: 32px;
                    }
                    .practical {
                        width: 272px;
                        top: 391px;
                        left: 0;
                    }
                    .personal {
                        width: 302px;
                        top: 429px;
                        right: 0;
                    }
                    .personality {
                        width: 361px;
                        left: 285px;
                        bottom: -20px;
                    }
                }
            }
        }
        .idea {
            height: 1040px;
            background-color: #F7FAFC;
            main {
                width: 1080px;
                height: 100%;
                margin: 0 auto;
                padding-top: 46px;

                h1 {
                    font-size: 58px;
                    font-weight: bold;
                    color: rgba(51, 51, 51, 1);
                    text-align: center;
                }
                .ideaBox {
                    width: 700px;
                    height: 700px;
                    margin: 96px auto 0;
                    position: relative;
                    > div + div {
                        width:200px;
                        height:200px;
                        background:rgba(255,255,255,1);
                        border-radius:50%;
                        position: absolute;
                        cursor: pointer;
                        transition: all .5s;
                        &.shadow {
                            box-shadow:0 0 30px 0 rgba(111,131,181,0.25);
                        }
                        p {
                            font-size:38px;
                            font-weight:500;
                            text-align: center;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        }
                    }
                    .knowledge {
                        top: 0;
                        left: 0;
                        p {
                            color:rgba(252,201,58,1);
                        }
                    }
                    .inspire {
                        top: 0;
                        right: 0;
                        p {
                            color:rgba(252,181,58,1);
                        }
                    }
                    .explore {
                        bottom: 0;
                        left: 0;
                        p {
                            color:rgba(252,157,58,1);
                        }
                    }
                    .innovation {
                        bottom: 0;
                        right: 0;
                        p {
                            color:rgba(252,143,58,1);
                        }
                    }
                    .centerCircle {
                        width:411px;
                        height:411px;
                        background:rgba(252,201,58,1);
                        border:12px solid rgba(255, 255, 255, 1);
                        box-shadow:0 0 30px 0 rgba(111,131,181,0.25);
                        border-radius:50%;
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        p {
                            width:266px;
                            font-size:24px;
                            color:rgba(255,255,255,1);
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                        }
                    }
                }
            }
        }
        .ourSpecial {
            height: 1103px;
            padding-top: 104px;
            h1 {
                font-size: 58px;
                font-weight: bold;
                color: rgba(51, 51, 51, 1);
                text-align: center;
            }
            img {
                width: 677px;
                height: 686px;
                display: block;
                margin: 75px auto 0;
            }
        }
    }
    .homeModal {
        nput::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button{
            -webkit-appearance: none !important;
        }
        input[type="number"]{
            -moz-appearance:textfield;
        }
        width:630px !important;
        height:440px;
        .ant-form-item {
            margin-bottom: 33px;
        }
        .ant-form-item-with-help {
            margin-bottom: 0;
        }
        .ant-modal-content {
            border-radius:20px;
            .ant-modal-header {
                border-radius:20px 20px 0 0;
                border: 0;
                padding-top: 38px;
                div {
                    font-size:28px;
                    text-align: center;
                    font-weight:500;
                    color:rgba(51,51,51,1);
                }
            }
            .ant-modal-body {
                padding: 0 84px;
                margin-top: 15px;
                height: 304px;
                .ant-form-item-label {
                   label {
                       font-size:20px;
                       color:rgba(102,102,102,1);
                   }
                }
                .ant-form-item-control {
                    input {
                        border: 0;
                        border-bottom: 2px solid #F3F3F3;
                        font-size:24px;
                        color:rgba(51,51,51,1);
                        &:focus {
                            box-shadow: unset;
                        }
                    }
                    .ant-form-explain {
                        font-size:16px;
                        font-weight:400;
                        color:rgba(255,109,136,1);
                        margin-top: 9px;
                    }
                    .getVerificationCode {
                        width:120px;
                        height:43px;
                        line-height: 43px;
                        background:rgba(252,201,58,1);
                        border-radius:8px;
                        position: absolute;
                        right: 0;
                        top: -25px;
                        color:#333;
                        cursor: pointer;
                        text-align: center;
                        font-size:16px;
                        &.alreadyGetCode {
                            color: #333;
                        }
                    }
                }
            }
        }
        .ant-modal-footer {
            border-top: 0;
            padding: 0 84px 48px;
            margin-top: 14px;
            button {
                width: 100%;
                height:48px;
                border-radius:24px;
                font-size:18px;
                color: #333;
            }
        }
    }

</style>