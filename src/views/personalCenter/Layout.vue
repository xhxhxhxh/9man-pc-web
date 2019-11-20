<template>
    <div class="layout-container">
        <header>
            <div class="message">
                <div>消息通知:</div>
            </div>
        </header>
        <main>
            <div class="sideBar">
                <div :class="{sideBarItem: true, chosen: hashAddress === item.path}"  @click="$router.push($store.getters.roles.path + '/' + item.path)" v-for="(item, index) in $store.getters.roles[0].children" :key="index">
                    <img :src="item.meta['icon']" alt="">
                    <span class="text">{{item.meta['title']}}</span>
                </div>
            </div>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>

    export default {
        name: "Layout",
        data () {
            return {
                hashAddress: this.$route.path.split('/')[2]
            }
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
    .layout-container {
        height: 100%;
        padding-top: 100px;
        background-color: #F4F5F7;
        header {
            width: 816px;
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
            width: 816px;
            margin: 0 auto;
        }
        .sideBar {
            float: left;
            width:157px;
            height:320px;
            margin-right: 30px;
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
                    background-color:#FED45C;
                    position: relative;
                    &:after {
                        content: "";
                        background-color:#FED45C;
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
