<template>
    <div class="dragStudentVideo-container" draggable="true" @dragstart="startDrag" @dragend="endDrag"
         :style="{width: 414 * dragStudentVideoScale + 'px', height: 271 * dragStudentVideoScale + 'px'}">
        <div class="video-area">
            <video autoplay loop type="video/mp4" ref="video"
                   v-if="showVideo"></video>
            <span class="name">李老师</span>
            <div class="operate-area" :style="{width: 46 * dragStudentVideoScale + 'px', height: 202 * dragStudentVideoScale + 'px',
            top: 16 * dragStudentVideoScale + 'px', right: 13 * dragStudentVideoScale + 'px'}">
                <img src="./images/mute-stu.png" alt="">
                <img src="./images/star-stu.png" alt="">
                <img src="./images/control-stu.png" alt="">
            </div>
        </div>
    </div>
</template>

<script>
    import NetStatus from '@/components/liveBroadcast/NetStatus'
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    export default {
        name: "dragStudentVideo",
        data () {
            return {
                showVideo: true,
            }
        },
        props: [ 'dragVideoId', 'dragStudentVideoScale', 'rtcRoom'],
        components: {
            NetStatus,
            MikeStatus,
        },
        mounted () {

        },
        watch: {
            dragVideoId: function () {
                this.getStudentVideo()
            }
        },
        methods: {
            // 开始拖拽
            startDrag(e) {
                const params = {
                id: this.dragVideoId,
                x: e.offsetX,
                y: e.offsetY
                }
                this.$emit('startDragStudentVideo',params);
            },

            endDrag() {
                this.$emit('endDragStudentVideo');
            },

            beforeDrag() {
                this.$emit('endDragStudentVideo', true);
            },

            // 获取学生摄像头数据
            getStudentVideo () {
                const video = this.$refs.video
                console.log('dragVideo', this.rtcRoom)
                this.rtcRoom.on('media-receive',(peerId,stream) => {
                    console.log('--dragVideo--')
                    if (peerId === this.dragVideoId) {
                        try {
                            video.srcObject = stream;
                        } catch (error) {
                            video.src = window.URL.createObjectURL(stream);
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .dragStudentVideo-container {
        .video-area {
            float: left;
            width: 100%;
            height: 100%;
            border-radius: 20px;
            position: relative;
            background: url("images/background.png") no-repeat center;
            background-size: cover;
            overflow: hidden;
            video {
                width: 100%;
                height: 100%;
            }
            .operate-area {
                width: 46px;
                height: 202px;
                position: absolute;
                top: 21px;
                right: 17px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                img {
                    width: 100%;
                    cursor: pointer;
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
