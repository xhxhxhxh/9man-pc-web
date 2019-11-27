<template>
    <div class="kid-info-container" v-if="$store.state.identity === 2">
        <div class="kid-info">
            <img :src="userInfo.headimg? resourceUrl + userInfo.headimg: defaultAvatar" alt="">
            <div class="title">
                <span class="name">{{userInfo && userInfo.uname}}</span>
                <span class="star"><img src="../images/star.png" alt=""><span>99</span></span>
            </div>
            <a-button @click="$router.push('/personalCenter/updateStudentInfo/' + userInfo.id)">修改资料</a-button>
        </div>
    </div>
</template>

<script>
    import defaultAvatar from '../images/avatar.png';
    export default {
        name: "KidInfo",
        data () {
            return {
                defaultAvatar,
                resourceUrl: this.$store.state.resourceUrl + '/'
            }
        },
       computed: {
           userInfo () {
               return this.$store.getters.getKidsInfo[0]
           }
       },
        methods: {

        }
    }
</script>

<style lang="less" scoped>
    @import "../../../less/index.less";
    .kid-info-container {
        height:150px;
        padding: 15px 20px;
        background:rgba(255,255,255,1);
        border-radius:6px;
        overflow: hidden;
        margin-bottom: 10px;
        .kid-info {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            > img {
                width: 53px;
                height: 53px;
                display: block;
            }
            button {
                width:96px;
                height:28px;
                border:1px solid @themeColor;
                border-radius:14px;
                font-size: 14px;
                color: @themeColor;
                &:hover {
                    color: #fff;
                    background-color: @themeColor;
                }
            }
            .title {
                width: 100%;
                display: flex;
                justify-content: space-between;
                .name {
                    font-size:14px;
                    color:#312C2C;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .star {
                    display: flex;
                    height: 20px;
                    align-items: center;
                    img {
                        height: 100%;
                    }
                    span {
                        margin-left: 6px;
                        font-size:14px;
                        color: #312C2C;
                    }
                }
            }
        }
    }
</style>
