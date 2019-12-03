<template>
    <div class="kid-info-container" v-if="$store.state.identity === 2">
        <div class="kid-info">
            <img :src="userInfo.headimg? resourceUrl + userInfo.headimg: defaultAvatar" alt="">
            <div class="title">
                <span class="name">{{userInfo && userInfo.uname}}</span>
                <span class="star"><img src="../images/star.png" alt=""><span>99</span></span>
            </div>
            <router-link :to="'/personalCenter/updateStudentInfo/' + userInfo.id" tag="button">修改资料</router-link>
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
        height:180px;
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
                border-radius: 50%;
            }
            button {
                width:96px;
                height:34px;
                border:1px solid @themeColor;
                border-radius:14px;
                font-size: 16px;
                color: @themeColor;
                cursor: pointer;
                background-color: #fff;
                outline: unset;
                transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
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
                    font-size:16px;
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
                        font-size:16px;
                        color: #312C2C;
                    }
                }
            }
        }
    }
</style>
