<template>
    <div class="layout-container">
        <div class="layout-top">
            <div class="logo">
                <img src="./images/logo.png" alt="" @click="$router.push('/')">
            </div>
        </div>
        <header>
            <div class="message">
                <div>消息通知:</div>
            </div>
        </header>
        <main>
            <div class="sideBar-box">
<!--                <KidInfo></KidInfo>-->
                <div class="sideBar">
                    <router-link :class="{sideBarItem: true, chosen: hashAddress === item.path}" tag="div"
                         :to="$store.getters.roles[0].path + '/' + item.path"
                         v-for="(item, index) in $store.getters.roles[0].children" :key="index" v-if="!item.meta.hidden">
                        <icon-font :type="item.meta['icon']" />
                        <span class="text">{{item.meta['title']}}</span>
                    </router-link>
                </div>
            </div>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
    // import KidInfo from './components/KidInfo';
    import { Icon } from 'ant-design-vue';

    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: 'https://at.alicdn.com/t/font_1543360_gvoesus2nya.js',
    });

    export default {
        name: "Layout",
        data () {
            return {
                hashAddress: this.$route.path.split('/')[2]
            }
        },
        components: {
            // KidInfo,
            IconFont
        },
        computed: {
            routes() {
                // return this.$router.options.routes.concat(this.$store.getters.roles)
            },
        },
        watch:{
            $route(to,from){
                this.hashAddress = to.path.split('/')[2]
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "../../less/index.less";
    .layout-container {
        min-height: 100%;
        background-color: #F4F5F7;
        .layout-top {
            height: 50px;
            background-color: @themeColor;
            overflow: hidden;
            margin-bottom: 37px;
            .logo {
                width: 1200px;
                margin: 0 auto;
                img {
                    display: block;
                    margin-top: 3px;
                    cursor: pointer;
                }
            }
        }
        header {
            width: 1200px;
            margin: 0 auto 35px;
            background-color: #fff;
            height: 44px;
            border-radius:6px;
            .message {
                height: 100%;
                padding: 10px 55px;
                > div {
                    height: 100%;
                    line-height: 24px;
                    display: inline-block;
                    font-size: 14px;
                    color: #000;
                }
            }
        }
        main {
            width: 1200px;
            margin: 0 auto;
            padding-bottom: 24px;
        }
        .sideBar-box {
            float: left;
            width: 190px;
            margin-right: 30px;
        }
        .sideBar {
            height:400px;
            user-select: none;
            .sideBarItem {
                height:25%;
                line-height: 100px;
                background-color:#fff;
                font-size:18px;
                color: #312C2C;
                cursor: pointer;
                padding: 0 43px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .text {
                    display: inline-block;
                    width: 72px;
                    text-align: justify;
                    text-align-last: justify;
                }
                i {
                    font-size: 21px;
                }
                &:first-of-type {
                    border-radius:6px 6px 0 0;
                }
                &:last-of-type {
                    border-radius:0 0 6px 6px;
                }
                &.chosen {
                    background-color:@themeColor;
                    position: relative;
                    color: #fff;
                    &:after {
                        content: "";
                        background-color:@themeColor;
                        position: absolute;
                        width: 12px;
                        height: 12px;
                        right: -6px;
                        top: 50%;
                        transform: translate(0, -50%) rotate(45deg);
                    }
                }
            }
        }
    }

</style>
