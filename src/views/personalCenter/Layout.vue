<template>
    <div class="layout-container">
        <header>
            <div class="message">
                <div>消息通知:</div>
            </div>
        </header>
        <main>
            <div class="sideBar-box">
                <KidInfo></KidInfo>
                <div class="sideBar">
                    <router-link :class="{sideBarItem: true, chosen: hashAddress === item.path}" tag="div"
                         :to="$store.getters.roles[0].path + '/' + item.path"
                         v-for="(item, index) in $store.getters.roles[0].children" :key="index" v-if="!item.meta.hidden">
                        <img :src="item.meta['icon']" alt="">
                        <span class="text">{{item.meta['title']}}</span>
                    </router-link>
                </div>
            </div>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
    import KidInfo from './components/KidInfo';

    export default {
        name: "Layout",
        data () {
            return {
                hashAddress: this.$route.path.split('/')[2]
            }
        },
        components: {
            KidInfo
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
        height: 100%;
        padding-top: 90px;
        background-color: #F4F5F7;
        header {
            width: 1100px;
            margin: 0 auto 35px;
            background-color: #fff;
            height: 44px;
            border-radius:6px;
            .message {
                height: 100%;
                padding: 10px 30px;
                > div {
                    height: 100%;
                    line-height: 24px;
                    display: inline-block;
                    font-size: 12px;
                    color: #000;
                }
            }
        }
        main {
            width: 1100px;
            margin: 0 auto;
        }
        .sideBar-box {
            float: left;
            width: 157px;
            margin-right: 30px;
        }
        .sideBar {
            height:320px;
            user-select: none;
            .sideBarItem {
                height:25%;
                line-height: 80px;
                background-color:#312C2C;
                font-size:16px;
                color: #fff;
                cursor: pointer;
                padding: 0 28px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .text {
                    display: inline-block;
                    width: 65px;
                    text-align: justify;
                    text-align-last: justify;
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
