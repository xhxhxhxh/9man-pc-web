<template>
    <a-config-provider :getPopupContainer="getPopupContainer">
        <div class="app-container" id="app">
            <router-view></router-view>
        </div>
    </a-config-provider>
</template>

<script>
    import TopBar from '@/components/TopBar/TopBar';
    export default {
        name: "app",
        data(){
            return {
                rootUrl: this.$store.state.rootUrl,
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

            getPopupContainer(el, dialogContext) {
                if (dialogContext) {
                    return dialogContext.getDialogWrap();
                } else {
                    return document.body;
                }
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
