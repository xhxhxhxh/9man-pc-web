<template>
    <div class="topBar-container">
        <div class="logo">少儿思维</div>
        <div class="nav">
            <a-menu
                    :defaultSelectedKeys="[hashAddress]"
                    :selectedKeys="[hashAddress]"
                    mode="horizontal"
            >
                <a-menu-item key="home" @click="$router.push('/home')">
                  首页
                </a-menu-item>
                <a-menu-item key="course" @click="$router.push('/course')" v-if="$store.state.identity !== '1'">
                    我的课程
                </a-menu-item>
                <a-menu-item key="teachers" v-if="$store.state.identity !== '1'">
                    老师入驻
                </a-menu-item>
                <a-menu-item key="adminManage" @click="$router.push('/adminManage')" v-else>
                    后台管理
                </a-menu-item>
                <a-menu-item key="about">
                    关于我们
                </a-menu-item>
                <a-menu-item key="liveBroadcast" @click="$router.push('/liveBroadcast')">
                   直播
                </a-menu-item>
                <a-menu-item key="liveBroadcast2" @click="$router.push('/liveBroadcast2')">
                    学生直播
                </a-menu-item>
            </a-menu>
        </div>
        <div class="login">
            <a-button @click="$router.push('/login')" v-if="$store.state.identity === ''">登 录</a-button>
            <div class="avatar" v-else>
                <a-popover placement="bottomRight" overlayClassName="userInfo">
                    <template slot="content">
                        <p @click="$router.push('/users')">{{$store.getters.username | normalUrlEncode}}</p>
                        <p @click="logout">退出登录</p>
                    </template>
                    <img :src="$store.getters.userInfo | normalUrlEncode" alt="">
                </a-popover>
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
              hashAddress: this.$route.path.split('/')[1],
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
                localStorage.removeItem('id')
                if (this.$route.path !== '/home') {
                    this.$router.push('/login')
                } else {
                    this.$store.commit('setIdentity', '')
                }

                // this.$store.commit('setIdentity', '')

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

<style lang="less">
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
        height: 60px;
        background: rgba(255,255,255,1);
        box-shadow: 0 5px 9px 0 rgba(136,153,191,0.1);
        display: flex;
        justify-content: space-between;
        padding: 0 79px;
        position: absolute;
        top: 0;
        left: 0;

        > div {
            display: flex;
            align-items: center;
        }
        .logo {
            font-size: 14px;
            color: #333;
            font-weight:400;
        }
        .nav {
            .ant-menu {
                height: 100%;
                border: 0;
                .ant-menu-item {
                    height: 100%;
                    line-height: 60px;
                    font-size: 14px;
                    color: #333;
                    font-weight:300;
                    border-bottom: 0 solid #fff;
                    padding: 0;
                    margin: 0 50px;
                }
                .ant-menu-item:hover {
                    border-bottom: 6px solid #FCC93A;
                }
                .ant-menu-item-selected {
                    font-weight:bold;
                    border-bottom: 6px solid #FCC93A;
                }
            }
        }
        .login {
            width: 60px;
            button {
                border:2px solid #F37934;
                border-radius:8px;
                color: #F37934;
                box-shadow: unset;
                width: 62px;
                height: 30px;
                font-size: 12px;
                font-weight:400;
                &:hover {
                    background-color: #F37934!important;
                }
            }
            button:hover {
                background-color: rgba(255,227,0,1);
                color: #fff;
            }
            .avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                margin-left: 15px;
                cursor: pointer;
                img {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                }
            }
        }
    }
</style>
