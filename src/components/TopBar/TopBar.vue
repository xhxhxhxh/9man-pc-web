<template>
    <div class="topBar-container">
        <div class="logo">少儿思维</div>
        <div class="nav">
            <a-menu
                    :defaultSelectedKeys="[hashAddress]"
                    :selectedKeys="[hashAddress]"
                    mode="horizontal"
            >
                <a-menu-item key="home">
                  首页
                </a-menu-item>
                <a-menu-item key="course">
                    我的课程
                </a-menu-item>
                <a-menu-item key="teachers">
                    老师入驻
                </a-menu-item>
                <a-menu-item key="about">
                    关于我们
                </a-menu-item>
            </a-menu>
        </div>
        <div class="login">
            <a-button size="large">登 录</a-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TopBar",
        data () {
          return {
              hashAddress: this.$route.path.split('/')[1],
          }
        },
        watch:{
            $route(to,from){
                this.hashAddress = to.path.split('/')[1]
            }
        },
    }
</script>

<style lang="less" scoped>
    @media screen and (max-width: 1200px) {
        .topBar-container {
            padding: 0 40px !important;
            .ant-menu-item {
                margin: 0 20px !important;
            }
        }
    }
    .topBar-container {
        width: 100%;
        height: 88px;
        background: rgba(255,255,255,1);
        box-shadow: 0 5px 9px 0 rgba(136,153,191,0.1);
        display: flex;
        justify-content: space-between;
        padding: 0 79px;
        > div {
            display: flex;
            align-items: center;
        }
        .logo {
            font-size: 18px;
            color: #333;
            font-weight:400;
        }
        .nav {
            .ant-menu {
                height: 100%;
                border: 0;
                .ant-menu-item {
                    height: 100%;
                    line-height: 88px;
                    font-size: 18px;
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
            button {
                border:2px solid rgba(255,227,0,1);
                border-radius:8px;
                color: rgba(255,227,0,1);
                box-shadow: unset;
                width: 82px;
                font-size: 18px;
                font-weight:400;
            }
            button:hover {
                background-color: rgba(255,227,0,1);
                color: #fff;
            }
        }
    }
</style>