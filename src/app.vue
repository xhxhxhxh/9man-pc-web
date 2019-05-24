<template>
    <div class="app-container" id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: "app",
        data(){
            return {
                rootUrl: this.$store.state.rootUrl,
            }
        },
        created() {

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
    }

</style>