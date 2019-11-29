<template>
    <div class="topBar-container">
        <div class="topBar-box">
            <div class="logo">
                <img src="./images/logo.png" alt="">
            </div>
            <div class="login">
                <span class="contract">联系方式：15558067572</span>
                <a-button @click="$router.push('/login')" v-if="$store.state.identity === ''" class="first-button">登 录</a-button>
                <a-button @click="$router.push('/register')" v-if="$store.state.identity === ''" type="primary">注 册</a-button>
                <div class="personal-center" v-else>
                    <span class="hello">{{'你好,' + username}}</span>
                    <span class="personal" @click="$router.push('/personalCenter')">个人中心</span>
                    <span class="exit" @click="logout">退出登录</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import common from '@/api/common';
    export default {
        name: "TopBar",
        data () {
            const userInfo = common.getLocalStorage('userInfo');
          return {
              token: common.getLocalStorage('token'),
              hasLogin: true,
              username: userInfo.uname
          }
        },
        watch:{
            $route(to,from){
                this.hashAddress = to.path.split('/')[1]
            }
        },
        methods: {
            // 退出登录
            logout () {
                localStorage.removeItem('token')
                if (this.$route.path !== '/home') {
                    this.$router.push('/login')
                } else {
                    this.$store.commit('setIdentity', '')
                }
            }
        },
        filters: {
            // 一般url转码
            normalUrlEncode (value) {
                return decodeURIComponent(value);
            },
        }
    }
</script>

<style lang="less" scoped>
    @import "../../less/index.less";
    @media screen and (max-width: 1200px) {
        .topBar-container {
            padding: 0 40px !important;
            .ant-menu-item {
                margin: 0 20px !important;
            }
        }
    }
    .userInfo {
        .ant-popover-inner-content {
            width:160px;
            box-shadow:0 5px 9px 0 rgba(136,153,191,0.1);
            padding: 0;
            p {
                height: 56px;
                line-height: 56px;
                font-size:16px;
                color: #333;
                padding-left: 25px;
                margin-bottom: 0;
                cursor: pointer;
                &:first-of-type {
                    font-weight: bold;
                    border-bottom: 2px solid #f3f3f3;
                }
            }

        }
    }

    .topBar-container {
        width: 100%;
        height: 70px;
        background: rgba(255,255,255,1);
        box-shadow: 0 5px 9px 0 rgba(136,153,191,0.1);
        position: fixed;
        z-index: 999;
        top: 0;
        left: 0;

        .topBar-box {
            width: 1100px;
            margin: 0 auto;
            height: 100%;
            overflow: hidden;
            line-height: 70px;
        }
        .logo {
            height: 100%;
            line-height: 70px;
            float: left;
            img {
                vertical-align: middle;
            }
        }
        .login {
            float: right;
            .contract {
                color: @themeColor;
                font-size: 14px;
                margin-right: 27px;
            }
            button {
                border:1px solid @themeColor;
                border-radius:17px;
                box-shadow: unset;
                width: 68px;
                height: 34px;
                font-size: 14px;
                &.first-button {
                    color: @themeColor;
                    margin-right: 16px;
                }
            }
            .personal-center {
                display: inline-block;
                .personal {
                    color: @themeColor;
                    margin: 0 10px;
                    cursor: pointer;
                }
                .exit {
                    cursor: pointer;
                    &:hover {
                        color: @themeColor;
                    }
                }
            }
        }
    }
</style>
