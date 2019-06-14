<template>
    <div class="teacherCourse-container">
        <div class="courseItem">
            <header>一年一班</header>
            <main>
                <div class="left f_left">
                    <img src="./images/course.png" alt="">
                </div>
                <div class="right f_left">
                    <div class="content">
                        <h2 class="className">马丁一班</h2>
                        <p class="date">日期:&nbsp;&nbsp;&nbsp;2019.5.28</p>
                        <p class="time">时间:&nbsp;&nbsp;&nbsp;17：50</p>
                        <p class="courseCount">
                            <span class="totalCourseCount">总课时:&nbsp;80</span>
                            <span>已上课时:&nbsp;32</span>
                        </p>
                    </div>
                </div>
            </main>
            <a-button type="primary" class="entry">进入课堂</a-button>
        </div>
        <div class="courseItem">
            <header>一年一班</header>
            <main>
                <div class="left f_left">
                    <img src="./images/course.png" alt="">
                </div>
                <div class="right f_left">
                    <div class="content">
                        <h2 class="className">马丁一班</h2>
                        <p class="date">日期:&nbsp;&nbsp;&nbsp;2019.5.28</p>
                        <p class="time">时间:&nbsp;&nbsp;&nbsp;17：50</p>
                        <p class="courseCount">
                            <span class="totalCourseCount">总课时:&nbsp;80</span>
                            <span>已上课时:&nbsp;32</span>
                        </p>
                    </div>
                </div>
            </main>
            <a-button type="primary" class="entry">进入课堂</a-button>
        </div>
        <div class="courseItem">
            <header>一年一班</header>
            <main>
                <div class="left f_left">
                    <img src="./images/course.png" alt="">
                </div>
                <div class="right f_left">
                    <div class="content">
                        <h2 class="className">马丁一班</h2>
                        <p class="date">日期:&nbsp;&nbsp;&nbsp;2019.5.28</p>
                        <p class="time">时间:&nbsp;&nbsp;&nbsp;17：50</p>
                        <p class="courseCount">
                            <span class="totalCourseCount">总课时:&nbsp;80</span>
                            <span>已上课时:&nbsp;32</span>
                        </p>
                    </div>
                </div>
            </main>
            <a-button type="primary" class="entry">进入课堂</a-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TeacherCourse"
    }
</script>

<style lang="less" scoped>
    .teacherCourse-container {
        width:1200px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .courseItem {
            width:580px;
            height:420px;
            background:rgba(255,255,255,1);
            border-radius:8px;
            padding: 20px 76px;
            margin-bottom: 40px;
            header {
                font-size:36px;
                font-weight:bold;
                color:rgba(76,76,76,1);
                text-align: center;
                margin-bottom: 28px;
            }
            main {
                overflow: hidden;
                .left {
                    img {
                        width:140px;
                        height:176px;
                        border-radius:6px;
                    }
                }
                .right {
                    margin-left: 76px;
                    .content {
                        h2 {
                            font-size:24px;
                            color: #4C4C4C;
                            margin-bottom: 17px;
                        }
                        .date, .time {
                            font-size:16px;
                            color:rgba(76,76,76,1);
                            margin-bottom: 17px;
                        }
                        .courseCount {
                            font-size:12px;
                            color:rgba(102,102,102,1);
                            margin-top: 27px;
                            .totalCourseCount {
                                margin-right: 32px;
                            }
                        }

                    }
                }
            }
            .entry {
                display: block;
                width:360px;
                height:50px;
                border-radius:25px;
                font-size:20px;
                font-weight:bold;
                margin: 41px auto;
            }
        }
    }

</style>
