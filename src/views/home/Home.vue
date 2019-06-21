<template>
    <div class="home-container">
        <div class="banner">
            <main class="clearfix">
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
                    <img src="./images/message.png" alt="">
                    <a-button
                            type="primary"
                            size="large"
                            @click="apply = true"
                    >
                        立即领取
                    </a-button>
                </div>
                <img src="./images/banner2.png" alt="" class="table">
            </main>
        </div>
        <div class="education">
            <main>
                <h1>六级教学体系</h1>
                <img :src="webp? '/assets/education-webp.webp': '/assets/education.jpg'" alt="">
            </main>
        </div>
        <div class="special">
            <main>
                <h1>教学特色</h1>
                <div class="specialBox">
                    <div class="specialItem">
                        <img src="./images/science.png" alt="">
                        <h3>科学知识</h3>
                        <p>简单易懂的基础科学原理，神奇有趣，带孩子体验不一样的世界。</p>
                    </div>
                    <div class="specialItem">
                        <img src="./images/nous.png" alt="">
                        <h3>基本常识</h3>
                        <p>安全意识、环保意识、文明礼貌、独立 自主......点点滴滴，潜移默化成长路上常相伴。</p>
                    </div>
                    <div class="specialItem">
                        <img src="./images/life.png" alt="">
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
                        <img :src="webp? '/assets/ability-webp.webp': '/assets/ability.jpg'" alt="">
                        <span class="create-circle" @mouseenter="showMessage = 'create'" @mouseleave="showMessage = ''"></span>
                        <span class="logic-circle" @mouseenter="showMessage = 'logic'" @mouseleave="showMessage = ''"></span>
                        <span class="practical-circle" @mouseenter="showMessage = 'practical'" @mouseleave="showMessage = ''"></span>
                        <span class="personal-circle" @mouseenter="showMessage = 'personal'" @mouseleave="showMessage = ''"></span>
                        <span class="personality-circle" @mouseenter="showMessage = 'personality'" @mouseleave="showMessage = ''"></span>
                        <div :class="{create: true, showMessage: showMessage === 'create'}">
                            <p>创造思维是一种新颖而有价值的、非结论的，具有高度机动性和坚持性，且能清楚地勾划和 解决问题的思维活动。</p>
                        </div>
                        <div :class="{logic: true, showMessage: showMessage === 'logic'}">
                            <p>逻辑思维是指将思维内容联结、组织在一起的方式或形式。是人的一种认知结构，又是人运用范畴、概念去把握客体的能力结构。</p>
                        </div>
                        <div :class="{practical: true, showMessage: showMessage === 'practical'}">
                            <p>获取知识分享和行动教授给别人获得反馈或者卡顿儿，重新学习和丰富讲课内容</p>
                        </div>
                        <div :class="{personal: true, showMessage: showMessage === 'personal'}">
                            <p>在知识经济时代，个人能力是非常重要的，因为知识总是在更新，只有不断学习才能跟上时代的步伐。</p>
                        </div>
                        <div :class="{personality: true, showMessage: showMessage === 'personality'}">
                            <p>人格和素质，是这个世界上最坚固的基石，最可靠的依,赖是不能够用任何物质来取代的。</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
<!--        <div class="idea">-->
<!--            <main>-->
<!--                <h1>教学理念</h1>-->
<!--                <div class="ideaBox">-->
<!--                    <div class="centerCircle">-->
<!--                       <transition name="myFade" tag="div" mode="out-in">-->
<!--                           <p v-if="showIdea === 'knowledge'" key="1">一切行动的根源不过是“ 我想知道......”激发孩子的兴趣，让求知的过程不在枯燥乏味</p>-->
<!--                           <p v-if="showIdea === 'inspire'" key="2">站在“巨人”的肩膀上看世界资深教师带领孩子玩转数学世界</p>-->
<!--                           <p v-if="showIdea === 'explore'" key="3">百变的场景，生动的情节，奇妙的构思来吧，去探索，把一切未知变成已知</p>-->
<!--                           <p v-if="showIdea === 'innovation'" key="4">多领域学科知识融合，尽显数学魅力带领孩子多角度观察，让他们每一个想法都闪闪发光,用心记录孩子成长足迹</p>-->
<!--                       </transition>-->
<!--                    </div>-->
<!--                    <div @mouseenter="showIdea = 'knowledge'" :class="{knowledge: true, shadow: showIdea == 'knowledge'}"><p>求知</p></div>-->
<!--                    <div @mouseenter="showIdea = 'inspire'" :class="{inspire: true, shadow: showIdea == 'inspire'}"><p>启发</p></div>-->
<!--                    <div @mouseenter="showIdea = 'explore'" :class="{explore: true, shadow: showIdea == 'explore'}"><p>探索</p></div>-->
<!--                    <div @mouseenter="showIdea = 'innovation'" :class="{innovation: true, shadow: showIdea == 'innovation'}"><p>创新</p></div>-->
<!--                </div>-->
<!--            </main>-->

<!--        </div>-->
        <div class="idea">
            <main>
                <h1>教学理念</h1>
                <div class="ideaBox">
                    <div :class="{knowledge: true}">
                        <p>
                            <span class="title">求知</span>
                            <span class="content">一切行动的根源不过是“ 我想知道......”激发孩子的兴趣，让求知的过程不在枯燥乏味</span>
                        </p>
                        <div class="img"></div>
                        <div class="background"></div>
                    </div>
                    <div :class="{inspire: true}">
                        <p>
                            <span class="title">启发</span>
                            <span class="content">站在“巨人”的肩膀上看世界资深教师带领孩子玩转数学世界</span>
                        </p>
                        <div class="img"></div>
                        <div class="background"></div>
                    </div>
                    <div :class="{explore: true}">
                        <p>
                            <span class="title">探索</span>
                            <span class="content">百变的场景，生动的情节，奇妙的构思来吧，去探索，把一切未知变成已知</span>
                        </p>
                        <div class="img"></div>
                        <div class="background"></div>
                    </div>
                </div>
            </main>

        </div>
        <div class="ourSpecial">
            <main>
                <h1>我们的特色</h1>
                <img :src="webp? '/assets/idea-webp.webp': '/assets/idea.jpg'" alt="">
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
    import webpSupport from '@/api/webpSupport';
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
                rootUrl: this.$store.state.rootUrl,
                webp: false
            }
        },
        created () {
            this.webp = webpSupport();
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

            //发送验证码
            sendVerificationCode () {
                this.form.validateFields(['telephone'], (err, values) => {
                    if (err) return;
                    if (this.alreadyGetCode) return;
                    const params = {
                        mobile: values.telephone,
                        type: 0
                    };
                    this.$axios.get(this.rootUrl + '/indexapp.php?c=sendMessage&a=sendSms', {params})
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
            border-radius:40px;
            position: fixed;
            right: 80px;
            bottom: 80px;
            padding: 28px;
            line-height: 1.15;
            cursor: pointer;
            background:linear-gradient(-3deg,rgba(35,201,255,1),rgba(55,135,255,1));
            box-shadow:0 20px 50px 0 rgba(64,131,255,0.5), 0px -1px 2px 0px rgba(28,74,169,0.3), 1px 1px 2px 0px rgba(255,255,255,0.5);
            z-index: 999;
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
            height: 673px;
            background: url("./images/banner.png") no-repeat center bottom;
            background-size: cover;

            main {
                width: 1080px;
                height: 100%;
                margin: 0 auto;
                position: relative;

                .table {
                    position: absolute;
                    width: 647px;
                    height: 471px;
                    bottom: 36px;
                    right: -85px;
                }

                .title {
                    margin-top: 85px;
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
                    bottom: 133px;
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
            height: 1106px;

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
                    margin-top: 94px;
                    margin-bottom: 0;
                }

                img {
                    width: 100%;
                    margin-top: 55px;
                }
            }
        }

        .special {
            height: 840px;
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
                height: 500px;
                margin-top: 84px;
                .specialItem {
                    float: left;
                    width: 360px;
                    height: 100%;
                    background: rgba(255, 255, 255, .5);
                    padding: 55px;
                    border-radius:20px;
                    transition: all .5s;
                    cursor: pointer;
                    &:hover {
                        box-shadow:0 0 30px 0 rgba(64,78,112,0.2);
                        background-color: #fff;
                    }
                    img {
                        width: 235px;
                        height: 224px;
                        display: block;
                        margin: 0 auto 65px;

                    }
                    h3 {
                        font-size: 32px;
                        font-weight: 500;
                        color: #FF5E28;
                        text-align: center;
                        margin-bottom: 16px;
                    }
                    p {
                        font-size:16px;
                        color:rgba(51,51,51,1);
                    }
                }
            }
        }
        .ability {
            height: 993px;
            main {
                height: 100%;
                margin: 0 auto;
                padding-top: 63px;
                h1 {
                    font-size: 58px;
                    font-weight: bold;
                    color: rgba(51, 51, 51, 1);
                    text-align: center;
                    margin-bottom: 34px;
                }
                .mind {
                    height: 666px;
                    background-color: #EFEFEF;
                    position: relative;
                    .image {
                        width: 1080px;
                        height: 100%;
                        margin: 0 auto;
                        position: relative;
                        img {
                            width: 100%;
                            height: 100%;
                        }
                        span {
                            display: block;
                            width: 102px;
                            height: 102px;
                            position: absolute;
                            border-radius: 50%;
                            cursor: pointer;
                        }
                        .create-circle {
                            top: 56px;
                            left: 252px;
                        }
                        .logic-circle {
                            top: 230px;
                            left: 62px;
                        }
                        .practical-circle {
                            top: 66px;
                            right: 59px;
                        }
                        .personal-circle {
                            bottom: 88px;
                            left: 136px;
                        }
                        .personality-circle {
                            bottom: 226px;
                            right: 55px;
                        }
                        > div {
                            padding: 24px 31px;
                            box-shadow:0 0 20px 0 rgba(64,78,112,0.16);
                            border-radius:10px;
                            position: absolute;
                            opacity: 0;
                            transition: all .5s;
                            background-color: #fff;
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
                            top: 59px;
                            left: 385px;
                        }
                        .logic {
                            width: 340px;
                            top: 232px;
                            left: 195px;
                        }
                        .practical {
                            width: 396px;
                            top: 72px;
                            right: 190px;
                        }
                        .personal {
                            width: 302px;
                            bottom: 91px;
                            left: 268px;
                        }
                        .personality {
                            width: 361px;
                            right: 201px;
                            bottom: 229px;
                        }
                    }

                }
            }
        }
        .idea {
            height: 920px;
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
                    height: 520px;
                    margin: 129px auto 0;
                    > div {
                        width:340px;
                        height:100%;
                        border-radius: 150px 0 150px 0;
                        cursor: pointer;
                        position: relative;
                        float: left;
                        overflow: hidden;
                        &:hover {
                            .img {
                                opacity: 0;
                            }
                            .background {
                                background-color: #FF8329;
                                opacity: 1;
                            }

                            p {
                                top: 63px;
                            }
                        }
                        > div {
                            position: absolute;
                            left: 0;
                            top: 0;
                            height: 100%;
                            width: 100%;
                            background-position: center;
                            background-size: cover;
                            z-index: 2;
                            transition: all .5s;
                        }
                        .background {
                            background-color: rgba(0,0,0,.2);
                        }
                        p {
                            width: 100%;
                            padding: 0 35px;
                            position: absolute;
                            left: 50%;
                            top: 343px;
                            transform: translate(-50%, 0);
                            transition: .5s ease;
                            color: #fff;
                            z-index: 3;
                            .title {
                                font-size:72px;
                                font-weight:500;
                                text-align: center;
                                display: block;
                                margin-bottom: 110px;
                            }
                            .content {
                                font-size:30px;
                            }
                        }
                    }
                    .knowledge {
                        .img {
                            background-image: url('./images/knowledge.jpg');
                        }
                    }
                    .inspire {
                        margin: 0 30px;
                        .img {
                            background-image: url('./images/inspire.jpg');
                        }
                    }
                    .explore {
                        .img {
                            background-image: url('./images/explore.jpg');
                        }
                    }
                }
            }
        }
        .ourSpecial {
            height: 1163px;
            padding-top: 76px;
            h1 {
                font-size: 58px;
                font-weight: bold;
                color: rgba(51, 51, 51, 1);
                text-align: center;
            }
            img {
                width: 1015px;
                height: 862px;
                display: block;
                margin: 53px auto 0;
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
                        border-radius: unset;
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
