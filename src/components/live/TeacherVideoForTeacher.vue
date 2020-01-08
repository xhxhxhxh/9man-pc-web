<template>
    <div class="teacherVideo-container">
        <div class="video-area">
            <video autoplay width="308" height="202" loop type="video/mp4" ref="video" muted></video>
            <span class="name">{{teacherName}}</span>
        </div>
        <div class="operate-area">
<!--            <button @click="() => {$emit('pictureCovered')}" :class="{disable: studentsNum}"><img src="./images/cover.png" alt="">视频铺满</button>-->
<!--            <button :class="{muteAll: !$store.getters.updateAudioStatus, mute: true}"-->
<!--                    @click="$store.commit('updateAudioStatusAll')">-->
<!--                <img :src="muteSrc" alt="">{{muteText}}-->
<!--            </button>-->
<!--            <button :class="{controlAll: $store.getters.controlAllStatus, control: true}"-->
<!--                    @click="$store.commit('updateControlStatusAll')" >-->
<!--                <img :src="controlSrc" alt="">{{controlText}}-->
<!--            </button>-->
        </div>
    </div>
</template>

<script>
    import muteImg from './images/onStage.png'
    import controlImg from './images/control.png'
    import cancelControlImg from './images/star.png'

    export default {
        name: "TeacherVideo",
        data () {
            return {

            }
        },
        props: ['rtcRoom', 'teacherName', 'peerIdList', 'stream'],
        created () {

        },
        watch: {
            stream: function (val) {
                const video = this.$refs.video
                try {
                    video.srcObject = val;
                } catch (error) {
                    video.src = window.URL.createObjectURL(val);
                }
            }
        },
        computed: {
            muteSrc () {
                if (this.$store.getters.updateAudioStatus) {
                    return muteImg
                }else {
                    return cancelMuteImg
                }
            },
            muteText () {
                if (this.$store.getters.updateAudioStatus) {
                    return '全部静音'
                }else {
                    return '取消静音'
                }
            },
            controlSrc () {
                if (!this.$store.getters.controlAllStatus) {
                    return controlImg
                }else {
                    return cancelControlImg
                }
            },
            controlText () {
                if (!this.$store.getters.controlAllStatus) {
                    return '全部操作'
                }else {
                    return '取消操作'
                }
            },
            // 房间内学生数
            studentsNum () {
                const studentsNum = this.peerIdList.length
                if (studentsNum === 0) {
                    return true
                }else {
                    return false
                }
            }
        },
        methods: {



        }
    }
</script>

<style lang="less" scoped>
    .teacherVideo-container {
        .video-area {
            float: left;
            width: 308px;
            height: 202px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            video {
                width: 100%;
                height: 100%;
            }
            .name {
                display: inline-block;
                text-align: center;
                width: 61px;
                height: 20px;
                color: #fff;
                font-size: 13px;
                background-color: rgba(0,0,0,.3);
                border-radius: 10px;
                position:absolute;
                top: 10px;
                left: 10px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .operate-area {
            margin-left: 20px;
            float: left;
            height: 202px;
            width: 150px;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            button {
                width:100%;
                height:48px;
                border-radius:10px;
                font-size: 21px;
                color: #fff;
                border: 0;
                cursor: pointer;
                outline: unset;
                &.mute {
                    &.muteAll {
                        background: #fff;
                        color: #FF6A04;
                    }
                }
                &.control {
                    &.controlAll {
                        background: #fff;
                        color: #FF6A04;
                    }
                }
                &.disable {
                    background: #CDCDCD !important;
                    cursor: unset;
                }
                img {
                    width: 21px;
                    height: 21px;
                    margin-right: 10px;
                }
            }
        }
        @media (max-width: 1550px){
            .operate-area {
                margin-left: 10px;
                width: 120px;
                button {
                    font-size: 18px;
                    img {
                        width: 18px;
                        height: 18px;
                    }
                }
            }
        }
        @media (max-width: 1410px){
            .operate-area {
                margin-left: 5px;
                width: 70px;
                button {
                    font-size: 14px;
                    img {
                        display: none;
                    }
                }
            }
        }
        @media (max-width: 1250px){
            .operate-area {
                margin-left: 5px;
                width: 60px;
            }
        }
    }
</style>
