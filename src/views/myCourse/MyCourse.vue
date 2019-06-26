<template>
    <div class="myCourse-container">
        <div class="left f_left">
            <img src="./images/course.png" alt="">
        </div>
        <div class="right f_left">
            <h1>少儿思维LV1</h1>
            <div class="content">
                <h2 class="className">马丁一班</h2>
                <p class="totalCourseCount"><span class="title">总课时：</span><span class="red">96</span></p>
                <p class="courseCount">
                    <span class="title">已上课时：</span><span class="red">32</span>
                    <span class="remain">剩余课时：</span><span class="red">64</span>
                </p>
                <p class="courseTime">
                    <span class="date">日期：&nbsp;2019.5.28</span>
                    <span class="time">时间：&nbsp;17：50</span>
                </p>
            </div>
            <a-button type="primary" class="entry">进入课堂</a-button>
        </div>
    </div>
</template>

<script>
    import common from '@/api/common';
    export default {
        name: "MyCourse",
        data () {
            return {
                id: common.getLocalStorage('id'),
                rootUrl: this.$store.state.rootUrl,
            }
        },
        created () {
            this.queryCourse()
        },
        methods: {
            // 获取课程信息
            queryCourse () {
                const params = {
                    id: this.id,
                };
                if (this.$store.state.identity === '0') {
                    Object.assign(params, {isstudent: 0})
                } else {
                    Object.assign(params, {isstudent: 1})
                }
                this.$axios.get( this.rootUrl + '/indexapp.php?c=CTLesson&a=QueryCTUserClass', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code == 200) {

                        } else {
                            this.$message.warning(data.msg,3);
                        }
                    })
                    .catch(err => {

                    })
            }
        }
    }
</script>

<style lang="less" scoped>
    .myCourse-container {
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
                    margin-bottom: 6px;
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
                .courseCount {
                    margin-bottom: 18px;
                    .title, .remain {
                        font-size:18px;
                        color: #666;
                    }
                    .red {
                        font-size:22px;
                        color:rgba(255,55,55,1);
                        margin-left: 12px;
                        margin-right: 55px;
                    }
                }
                .courseTime {
                    margin-bottom: 35px;
                    font-size:14px;
                    color: #666;
                    .date {
                        margin-right: 37px;
                    }
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
