<template>
    <div class="users-container">
        <div class="avatar">
            <main>
                <img src="./images/avatar.png" alt="" class="user-avatar">
                <div class="info">
                    <h1>夏目友人帐</h1>
                    <div class="star">
                        <img src="./images/star.png" alt="">
                        <p>6</p>
                    </div>
                    <div class="medal">
                        <img src="./images/medal.png" alt="">
                        <p>8</p>
                    </div>
                </div>
            </main>
        </div>
        <div class="userInfo">
            <header>
                <span @click="mode = 0" :class="{selected: mode === 0}">基本信息</span>
                <span @click="mode = 1" :class="{selected: mode === 1}">安全信息</span>
            </header>
            <main v-show="mode === 0">
                <p class="name">
                    <span class="title">名称：</span>
                    <a-input defaultValue="夏目友人帐" v-if="isModifyingName" v-focus/>
                    <span class="content" v-else>夏目友人帐</span>
                </p>
                <p class="age">
                    <span class="title">年龄：</span>
                    <span class="content">22</span>
                </p>
                <p class="education">
                    <span class="title">学历：</span>
                    <span class="content">本科</span>
                </p>
                <a-button type="primary" class="modify" @click="isModifyingName = true" v-if="!isModifyingName">修改</a-button>
                <a-button type="primary" class="modify" @click="isModifyingName = false" v-else>保存</a-button>
            </main>
            <main v-show="mode === 1">
                <p class="telephone">
                    <span class="title">手机号：</span>
                    <span class="content">17785859878</span>
                </p>
                <a-button type="primary" class="modifyPassword">修改密码</a-button>
            </main>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Users",
        data () {
            return {
                mode: 0, //0 基本信息 1 安全信息
                isModifyingName: false,
            }
        }
    }
</script>

<style lang="less" scoped>
    .users-container {
        height: 100%;
        background-color: #fafafa;
        .avatar {
            height: 460px;
            background-color: #fff;
            main {
                width: 1200px;
                margin: 0 auto;
                height: 100%;
                position: relative;
                overflow: hidden;
                .user-avatar {
                    width:160px;
                    height:160px;
                    border-radius:50%;
                    object-fit: cover;
                    position: absolute;
                    top: 129px;
                    left: 238px;
                }
                .info {
                    margin: 122px 0 0 628px;
                    color: #333;
                    h1 {
                        font-size:36px;
                        font-weight:600;
                        margin-bottom: 53px;
                    }
                    .star {
                        float: left;
                        margin-right: 93px;
                        img {
                            width: 45px;
                            height: 42px;
                        }
                        p {
                            font-size:36px;
                            text-align: center;
                            margin-top: 23px;
                        }
                    }
                    .medal {
                        float: left;
                        img {
                            width: 35px;
                            height: 45px;
                        }
                        p {
                            font-size:36px;
                            text-align: center;
                            margin-top: 20px;
                        }
                    }
                }
            }
        }
        .userInfo {
            width:1200px;
            height:360px;
            background:rgba(255,255,255,1);
            border-radius:10px;
            margin: 30px auto 0;
            header {
                height: 70px;
                border-bottom: 4px solid #fafafa;
                span {
                    display: inline-block;
                    width: 80px;
                    height: 100%;
                    text-align: center;
                    line-height: 66px;
                    font-size: 16px;
                    color: #666;
                    margin-left: 100px;
                    cursor: pointer;
                    &.selected {
                        color: #333;
                        position: relative;
                        font-weight: bold;
                        &::before {
                            content: '';
                            width:80px;
                            height:6px;
                            background:rgba(252,201,58,1);
                            position: absolute;
                            left: 0;
                            bottom: -5px;
                        }
                    }
                }
            }
            main {
                padding: 56px 0 0 103px;
                position: relative;
                p {
                    margin-bottom: 31px;
                    height: 44px;
                    line-height: 44px;
                    .title {
                        font-size: 12px;
                        color: #666;
                    }
                    .content {
                        font-size:16px;
                        color:rgba(51,51,51,1);
                        margin-left: 94px;
                    }
                }
                .name {
                    display: flex;
                    align-items: center;
                    input {
                        width:202px;
                        height:44px;
                        line-height: 48px;
                        border-radius:5px;
                        margin-left: 72px;
                        font-size:16px;
                        color:rgba(51,51,51,1);
                        padding-left: 21px;
                    }
                }
                .telephone {
                    .content {
                        margin-left: 29px;
                    }
                }
                .modify {
                    width:120px;
                    height:40px;
                    border-radius:6px;
                    font-size:16px;
                    color:rgba(51,51,51,1);
                    position: absolute;
                    top: 58px;
                    right: 76px;
                }
                .modifyPassword {
                    width:120px;
                    height:40px;
                    border-radius:10px;
                    font-size:16px;
                    color:rgba(51,51,51,1);
                    position: absolute;
                    top: 141px;
                    left: 104px;
                }
            }
        }
    }
</style>