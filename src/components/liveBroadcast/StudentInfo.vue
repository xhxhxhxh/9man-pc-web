<template>
    <div class="studentInfo-container">
        <div class="student-info">
            <p class="name">姓名</p>
            <div class="status-bar">
                <div class="mikeStatus">
                    <img src="./images/mike.png" alt="">
                    <MikeStatus :openMike="mikeStatus"></MikeStatus>
                </div>
                <div class="star">
                    <img src="./images/star.png" alt="">
                    <span>x8</span>
                </div>
            </div>
        </div>
        <div class="avatar">
            <div class="onStage">
                <p>上台中</p>
                <p>...</p>
            </div>
        </div>
    </div>
</template>

<script>
    import MikeStatus from '@/components/liveBroadcast/MikeStatus'
    export default {
        name: "StudentInfo",
        data () {
            return {
                mikeStatus: false
            }
        },
        components: {
            MikeStatus,
        },
    }
</script>

<style lang="less" scoped>
    .studentInfo-container {
        height: 66px;
        width: 194px;
        position: relative;
        .student-info {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translate(0, -50%);
            width:168px;
            height:52px;
            background:rgba(255,255,255,1);
            border-radius:20px;
            border: 3px solid #FF8A3A;
            padding: 3px 10px 3px 45px;
            .name {
                color: #535353;
                font-size: 14px;
                margin-bottom: 0;
            }
            .status-bar {
                height: 18px;
                width: 100%;
                font-size: 13px;
                color: #FF6A04;
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
        .avatar {
            position: absolute;
            top: 0;
            left: 0;
            width: 66px;
            height: 66px;
            border-radius: 50%;
            border: 3px solid #FF8A3A;
            background-color: #FF8A3A;
            .onStage {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                p {
                    font-size:18px;
                    color: #fff;
                    margin-bottom: 0;
                    &:last-of-type {
                        margin-top: -18px;
                    }
                }
            }
        }
    }
</style>
