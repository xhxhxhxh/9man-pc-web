<template>
    <div class="reserveCourse-container">
        <div class="left f_left">
            <img src="./images/course.png" alt="">
        </div>
        <div class="right f_left">
            <h1>少儿思维LV1</h1>
            <div class="content">
                <h2 class="className">马丁一班</h2>
                <p class="totalCourseCount"><span class="title">遗漏课时：</span><span class="red">96</span></p>
                <p class="courseTime">
                    <span class="date">日期：&nbsp;2019.5.28</span>
                </p>
                <p class="remark">一个月内可预约补课</p>
            </div>
            <a-button type="primary" class="entry">预约补课</a-button>
        </div>
    </div></template>

<script>
    export default {
        name: "ReserveCourse"
    }
</script>

<style lang="less" scoped>
    .reserveCourse-container {
        width:1000px;
        height:480px;
        background:rgba(255,255,255,1);
        border-radius:10px;
        float: left;
        padding: 28px 56px;
        .left {
            margin-top: 22px;
            img {
                width:260px;
                height:326px;
                border-radius:10px;
            }
        }
        .right {
            margin-left: 100px;
            width: 484px;
            h1 {
                font-size:36px;
                color:rgba(76,76,76,1);
                font-weight: bold;
                text-align: center;
            }
            .content {
                margin-top: 31px;
                h2 {
                    font-size:24px;
                    color: #333;
                    margin-bottom: 20px;
                }
                .totalCourseCount {
                    margin-bottom: 16px;
                    .title {
                        font-size:18px;
                        color: #666;
                    }
                    .red {
                        font-size:22px;
                        color:rgba(255,55,55,1);
                        margin-left: 12px;
                    }
                }
                .courseTime {
                    margin-bottom: 44px;
                    font-size:14px;
                    color: #666;
                    .date {
                        margin-right: 37px;
                    }
                }
                .remark {
                    margin-bottom: 8px;
                    font-size:16px;
                    color:rgba(153,153,153,1);
                }
            }
            .entry {
                width:240px;
                height:60px;
                border-radius:10px;
                font-size:24px;
                float: right;
                font-weight:bold;
            }
        }
    }

</style>