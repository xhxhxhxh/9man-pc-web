<template>
    <div class="teacherVideo-container">
        <div class="video-area">
            <video autoplay loop type="video/mp4" ref="video"></video>
            <span class="name">{{teacherName}}</span>
            <div class="status-bar">
                <div class="netStatus">
                    <NetStatus></NetStatus>
                    <span>网络状态</span>
                </div>
                <div class="mikeStatus">
                    <img src="./images/mike.png" alt="">
                    <MikeStatus :openMike="mikeStatus" :identity="identity" :rtcRoom="rtcRoom" :id="teacherId"></MikeStatus>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    export default {
        name: "TeacherVideo",
        data () {
            return {
                mikeStatus: true, // 开启麦克风
                identity: 'others',
            }
        },
        props: ['rtcRoom', 'teacherName', 'teacherId'],
        components: {
            NetStatus,
            MikeStatus,
        },
        created () {

        },
        mounted () {
            this.getTeacherVideo()
        },
        methods: {
            // 获取老师摄像头数据
            getTeacherVideo () {
                const video = this.$refs.video
                this.rtcRoom.on('media-receive',(peerId,stream) => {
                    if (peerId === this.teacherId) {
                        try {
                            video.srcObject = stream;
                        } catch (error) {
                            video.src = window.URL.createObjectURL(stream);
                        }
                    }
                })
            },

        }
    }
</script>

<style lang="less" scoped>
    .teacherVideo-container {
        .video-area {
            float: left;
            width: 635px;
            height: 416px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            video {
                width: 100%;
                height: 100%;
            }
            .status-bar {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 22px;
                background-color: #fff;
                width: 50%;
                font-size: 13px;
                color: #FF6A04;
                padding: 0 15px;
                transform: scale(2);
                transform-origin: left bottom;
                > div {
                    float: left;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    > div {
                        margin-right: 4px;
                    }
                }
                .mikeStatus {
                    margin-left: 20px;
                    img {
                        height: 17px;
                        margin-right: 4px;
                    }
                }
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
            }
        }
    }
</style>
