<template>
    <div class="reservingCourse-container">
        <div class="reserveCourse">
            <header>预约课程</header>
            <main>
                <div class="mode">
                    <a-button :class="{chosenMode: mode == 0}" @click="mode = 0">插班生</a-button>
                    <a-button :class="{chosenMode: mode == 1}" @click="mode = 1">一对一</a-button>
                </div>
                <div class="selectedClass" v-if="mode == 0">
                    <span>班级：</span>
                    <a-select v-model="selectedClass" style="width: 380px; height: 48px" :dropdownClassName="'chosenClass'">
                        <a-select-option value="班级一">班级一</a-select-option>
                        <a-select-option value="班级二">班级二</a-select-option>
                        <a-select-option value="班级三">班级三</a-select-option>
                        <a-select-option value="班级四">班级四</a-select-option>
                    </a-select>
                    <p>剩余插班次数：5</p>
                </div>
                <div class="selectedDate" v-else>
                    <div class="date">
                        <span>日期：</span>
                        <a-date-picker :format="dateFormat" :value="date" @change="dateChange"/>
                    </div>
                    <div class="time">
                        <span>时间：</span>
                        <a-time-picker  :value="time" @change="timeChange"/>
                    </div>
                    <p>剩余一对一次数：5</p>
                </div>
                <div class="submit">
                    <a-button>取消</a-button>
                    <a-button type="primary">确认</a-button>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ReservingCourse",
        data () {
            return {
                mode: 0,
                selectedClass: '班级一',
                dateFormat: 'YYYY/MM/DD',
                date: null,
                time: null,
            }
        },
        methods: {
            timeChange(time){
                this.time = time;
            },
            dateChange(date){
                this.date = date;
            }
        }
    }
</script>

<style lang="less">
    .reservingCourse-container {
        height: 100%;
        background-color: #fafafa;
        padding-top: 108px;
        .reserveCourse {
            margin: 0 auto;
            width:1200px;
            height:580px;
            background:rgba(255,255,255,1);
            border-radius:10px;
            overflow: hidden;
            header {
                height:60px;
                line-height: 60px;
                text-align: center;
                background:rgba(252,201,58,1);
                font-size:20px;
                font-weight:bold;
                color:rgba(76,76,76,1);
            }
            main {
                padding: 0 200px;
                position: relative;
                .mode {
                    height: 165px;
                    padding-top: 58px;
                    text-align: center;
                    border-bottom: 4px solid #f3f3f3;
                    button {
                        width:240px;
                        height:48px;
                        box-shadow:0 2px 7px 0 rgba(136,153,191,0.1);
                        border-radius:8px;
                        border: 0;
                        color: #666;
                        font-size: 18px;
                        &:first-of-type {
                            margin-right: 140px;
                        }
                    }
                    .chosenMode {
                        background:rgba(252,201,58,1);
                        box-shadow:0 6px 12px 0 rgba(255,170,78,0.3);
                        color: #333;
                    }
                }
            }
            .selectedClass {
                padding: 67px 168px 0;
                > span {
                    font-size:18px;
                    color:rgba(102,102,102,1);
                    margin-right: 25px;
                }
                > p {
                    font-size:14px;
                    color:rgba(153,153,153,1);
                    margin-top: 32px;
                }
                .ant-select-selection {
                    height: 46px;
                    /*border:2px solid rgba(243,243,243,1);*/
                    border-radius:6px;
                    .ant-select-selection__rendered {
                        margin-left: 25px;
                        margin-right: 25px;
                        line-height: 46px;
                        .ant-select-selection-selected-value {
                            font-size:20px;
                            color:rgba(51,51,51,1);
                        }
                    }
                }
            }
            .selectedDate {
                padding: 67px 260px 0;
                .date {
                    span:first-child {
                        font-size:16px;
                        color:#999;
                        margin-right: 8px;
                    }
                    .ant-calendar-picker-input {
                        height: 46px;
                        width: 220px;
                        font-size:16px;
                        padding-left: 25px;
                    }
                }
                .time {
                    margin-top: 15px;
                    span:first-child {
                        font-size:16px;
                        color:#999;
                        margin-right: 8px;
                    }
                    .ant-time-picker-input {
                        height: 46px;
                        width: 220px;
                        font-size:16px;
                        padding-left: 25px;
                    }
                    .ant-time-picker {
                        width: 220px;
                    }
                }
                > p {
                    font-size:14px;
                    color:rgba(153,153,153,1);
                    margin-top: 19px;
                }
            }
            .submit {
                text-align: center;
                position: absolute;
                left: 0;
                top: 417px;
                width: 100%;
                button {
                    width:180px;
                    height:48px;
                    border-radius:8px;
                    font-size:18px;
                    color:rgba(51,51,51,1);
                    &:first-of-type {
                        margin-right: 140px;
                        border: 0;
                        background-color: #f3f3f3;
                    }
                }
            }
        }
    }
    .chosenClass {
        li {
            height: 46px;
            line-height: 36px;
            font-size:20px;
            color:rgba(51,51,51,1);
            padding-left: 25px;
        }
    }

</style>