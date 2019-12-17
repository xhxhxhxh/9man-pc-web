<template>
    <div class="teacherVideo-container">
        <div class="video-area">
            <video autoplay loop type="video/mp4" ref="video"></video>
            <span class="name">{{teacherName}}</span>
        </div>
        <div class="status-area">
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
        user-select: none;
        border-radius: 20px 20px 0 0;
        padding-top: 75%;
        box-sizing: content-box;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background-image: url("images/teacherWillBack.png");
        background-size: cover;
        .video-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 20px 20px 0 0;
            video {
                border-radius: 20px 20px 0 0;
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

        .status-area {
            width: 50%;
            height: 0;
            left: 0;
            bottom: -44px;
            position: relative;
            border-radius: 0 0 10px 10px;
            transform: scale(2);
            transform-origin: left bottom;

            .status-bar {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 22px;
                background-color: #fff;
                width: 100%;
                font-size: 13px;
                color: #FF6A04;
                padding: 0 15px;
                transform-origin: left bottom;
                z-index: 2;
                border-radius: 0 0 10px 10px;

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

                .star {
                    float: right;

                    img {
                        height: 17px;
                        margin-right: 3px;
                    }
                }
            }
        }
        @media (max-width: 1600px) {
            .status-area {
                width: 100%;
                bottom: -22px;
                border-radius: 0 0 20px 20px;
                transform: scale(1);
                .status-bar {
                    border-radius: 0 0 20px 20px;
                }
            }
        }
    }
</style>
