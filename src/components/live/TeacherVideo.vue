<template>
    <div class="teacherVideo-container">
        <div class="video-area" @mouseenter="showOperateArea = true" @mouseleave="showOperateArea = false">
            <video autoplay loop type="video/mp4" ref="video" muted></video>
            <div :class="{'operate-area': true, show: showOperateArea}" v-if="role === 'teacher'">
                <div @click="setAllOperationStatus(!allOperation)"
                     :class="{controlAll: allOperation, 'operate-item': true}">
                    <img :src="controlImg" alt="">
                    <span>{{allOperation? '取消授权': '全部授权'}}</span>
                </div>
                <div @click="setAllStageStatus()"
                     :class="{controlAll: $store.getters.stageAllStatus, 'operate-item': true}">
                    <img :src="stageImg" alt="">
                    <span>{{$store.getters.stageAllStatus? '取消上台': '全部上台'}}</span>
                </div>
                <div class="operate-item">
                    <img :src="starImg" alt="">
                    <span>全部奖励</span>
                </div>
            </div>
        </div>
        <div class="teacher_name">{{teacherName}}</div>
    </div>
</template>

<script>
    import stageImg from './images/onStage.png'
    import controlImg from './images/control.png'
    import starImg from './images/star.png'

    export default {
        name: "TeacherVideo",
        data () {
            return {
                stageImg,
                controlImg,
                starImg,
                showOperateArea: false,
                allStage: false
            }
        },
        props: ['rtcRoom', 'teacherName', 'peerIdList', 'stream', 'role', 'studentList'],
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
            // 房间内学生数
            studentsNum () {
                const studentsNum = this.peerIdList.length
                if (studentsNum === 0) {
                    return true
                }else {
                    return false
                }
            },
            // 全部授权状态
            allOperation () {
                return this.$store.state.liveBroadcast.liveBroadcastData.allOperation
            }
        },
        methods: {
            setAllOperationStatus (status) {
                if (status && !this.$store.state.liveBroadcast.operatePermission) {
                    return this.$message.warning('动画模式下无法开启全部授权', 5);
                }

                // 学生下台
                const videoBoxArr = document.querySelectorAll('.video-box')
                videoBoxArr.forEach(videoBox => {
                    videoBox.classList.remove('onStage')
                    videoBox.children[0].style.top = ''
                    videoBox.children[0].style.left = ''
                })

                this.$store.commit('updateStageStatusAll', false)
                this.$store.commit('setAllOperationStatus',status)
            },

            setAllStageStatus () {
                if (this.$store.getters.updateControlStatus) {
                    return this.$message.warning('前先关闭学生授权', 5);
                }
                const stageAllStatus = this.$store.getters.stageAllStatus

                this.studentList.forEach(item => {
                    if (item.isconnect) {
                        const id = item.uid
                        const videoBox = document.querySelector('#studentVideo' + id).parentElement
                        if (stageAllStatus) { // 取消所有学生上台
                            videoBox.classList.remove('onStage')
                            videoBox.children[0].style.top = ''
                            videoBox.children[0].style.left = ''
                        } else {
                            videoBox.classList.add('onStage')
                        }
                    }
                })

                this.$store.commit('updateStageStatusAll', !this.$store.getters.stageAllStatus)
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../../less/index";
    .teacherVideo-container {
        height: 540rem/@baseFontSize;
        border-radius:10rem/@baseFontSize 10rem/@baseFontSize 0 0;
        .video-area {
            width: 100%;
            height: 439rem/@baseFontSize;
            border-radius:10rem/@baseFontSize 10rem/@baseFontSize 0 0;
            overflow: hidden;
            position: relative;
            background:url("./images/teacher_coming.png") no-repeat;
            background-size: cover;
            video {
                width: 100%;
                height: 100%;
            }
            .operate-area {
                height: 100rem/@baseFontSize;
                width: 465rem/@baseFontSize;
                position: absolute;
                left: 50%;
                bottom: 0;
                transform: translate(-50%, 150%);
                transition: all .3s ease;
                display: flex;
                justify-content: space-between;
                &.show {
                    transform: translate(-50%, 0);
                }
                .operate-item {
                    width: 90rem/@baseFontSize;
                    height: 90rem/@baseFontSize;
                    cursor: pointer;
                    background:rgba(27,27,27,0.3);
                    border:1rem/@baseFontSize solid rgba(255,255,255,1);
                    border-radius:10rem/@baseFontSize;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    align-items: center;
                    user-select: none;
                    img {
                        display: block;
                        width: 31rem/@baseFontSize;
                        height: 31rem/@baseFontSize;
                    }
                    span {
                        font-size:14rem/@baseFontSize;
                        color:rgba(255,255,255,1);
                    }
                    &:last-of-type {
                        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                        &:hover {
                            background:rgba(248,87,21,1);
                        }
                    }
                    &.controlAll {
                        background:rgba(248,87,21,1);
                    }
                }
            }
        }
        .teacher_name {
            height: 101rem/@baseFontSize;
            background-color: #fff;
            font-size:28rem/@baseFontSize;
            line-height: 101rem/@baseFontSize;
            color:rgba(27,27,27,1);
            text-align: center;
            border-radius:0 0 10rem/@baseFontSize 10rem/@baseFontSize;
        }
    }
</style>
