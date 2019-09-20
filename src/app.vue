<template>
    <a-locale-provider :locale="locale">
        <div class="app-container" id="app">
            <TopBar></TopBar>
            <router-view></router-view>
        </div>
    </a-locale-provider>
</template>

<script>
    import TopBar from '@/components/TopBar/TopBar';
    import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
    export default {
        name: "app",
        data(){
            return {
                rootUrl: this.$store.state.rootUrl,
                locale: zhCN,
            }
        },
        created() {

        },
        components: {
            TopBar
        },
        methods: {

            //获取头像
            getAvatar () {
                this.$axios.get(this.rootUrl + '/getAvatar')
                    .then(results => {
                        let data = results.data;
                        if (data['err_code'] == 200) {
                            this.avatar = data.message[0].avatar;
                        } else{

                        }
                    })
                    .catch(err => {

                    })
            },

        },
    }
</script>

<style lang="less">
    html {
        height: 100%;
    }
    body {
        height: 100%;
        background-color: #fff;
    }
    .app-container {
        height: 100%;
        width: 100%;
        min-height: 320px;
        position: relative;
    }

</style>
