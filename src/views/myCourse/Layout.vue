<template>
    <div class="layout-container">
        <main>
            <div class="sideBar">
                <div :class="{sideBarItem: true, chosen: hashAddress === item.path}"  @click="$router.push('/course/' + item.path)" v-for="(item, index) in studentRouter" :key="index">
                    <span>{{item.meta['title']}}</span>
                </div>
            </div>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
    import studentRouter from '@/router/studentRouter'
    export default {
        name: "Layout",
        data () {
            return {
                studentRouter,
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
        padding-top: 40px;
        background-color: #FAFAFA;
        main {
            width: 1220px;
            margin: 0 auto;
            height: 480px;
        }
        .sideBar {
            float: left;
            width:180px;
            height:480px;
            background:linear-gradient(0deg,rgba(54,49,78,1),rgba(76,70,104,1));
            box-shadow:0 3px 8px 0 rgba(124,158,236,0.3);
            border-radius:10px;
            padding: 30px 0 30px 20px;
            margin-right: 20px;
            .sideBarItem {
                width:140px;
                height:50px;
                background:rgba(255,255,255,.8);
                border-radius:10px;
                line-height: 50px;
                font-size:20px;
                color: #333;
                margin-bottom: 30px;
                cursor: pointer;
                letter-spacing: 2px;
                &.chosen {
                    width: 100%;
                    border-radius:10px 0 0 10px;
                    background-color: #fff;
                    position: relative;
                    &:before {
                        content: '';
                        width:4px;
                        height:18px;
                        background:rgba(252,201,58,1);
                        box-shadow:0 0 6px 0 rgba(255,151,49,0.9);
                        border-radius:2px;
                        position: absolute;
                        top: 50%;
                        right: 18px;
                        transform: translate(0, -50%);
                    }
                }
                span {
                    margin-left: 30px;
                }
            }
        }
    }

</style>