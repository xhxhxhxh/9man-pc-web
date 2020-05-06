<template>
    <div class="course-container">
        <div class="course-box">
            <h1 class="title">
                <div class="line"></div>
                <span>课程</span>
            </h1>
            <header>
                <a-button size="large" :class="{chosen: isRecent}"
                          @click="() => {pageNum = 1; isRecent = true; queryCourse()}">近期课程</a-button>
                <a-button size="large" :class="{chosen: !isRecent}"
                          @click="() => {pageNum = 1; isRecent = false; queryCourse()}">所有课程</a-button>
            </header>
            <main>
                <div class="spin" v-show="loading">
                    <a-spin tip="正在查询课程，请稍后..."></a-spin>
                </div>
                <div class="no-course" v-show="!loading && courseList.length === 0">
                    <img src="./images/nocourse.png" alt="">
                    <p v-if="$store.state.identity === 1">老师您好!</p>
                    <p v-else>同学您好!</p>
                    <p>您还没有课程，请尽快联系教务顾问</p>
                </div>
                <div class="course-list clearFix" v-show="!loading && courseList.length > 0">
                    <table>
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>课件名称</th>
                                <th>班级</th>
                                <th>学生</th>
                                <th>上课时间</th>
                                <th>学习进度</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in courseList" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item['courseware_name'] }}</td>
<!--                                <td>-->
<!--                                    {{ item.type === 1? '正式课': '试听课' }}-->
<!--                                    {{ item.name? '《' + item.name + '》': '' }}-->
<!--                                </td>-->
                                <td>{{ item['class_name'] }}</td>
                                <td>小小小</td>
                                <td class="class-time">
                                    <p>{{formatterDate(item.planstarttime)}}</p>
                                    <p>{{formatterWeek(item.planstarttime)}}</p>
                                </td>
                                <td>{{item.type === 1? '已学习': '未学习'}}</td>
                                <td class="join-class">
                                    <a-button type="primary" @click="queryClassInfo(item, 'goLive')">进入教室</a-button>
                                    <a-button type="primary" @click="queryClassInfo(item, 'resetClass')">重置课堂</a-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <a-pagination showQuickJumper :current="pageNum" :total="totalCount" @change="onPageChange"
                                  :defaultPageSize="pageSize" size="small"/>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
    import common from '@/api/common';
    import moment from 'moment';
    export default {
        name: "course",
        data () {
            const userInfo = common.getLocalStorage('userInfo')
            return {
                rootUrl: this.$store.state.apiUrl,
                userId: userInfo.uid,
                userName: userInfo.uname,
                loading: true,
                roomId: '',
                pageNum: 1,
                pageSize: 10,
                courseList: [],
                totalCount: 0,
                isRecent: true
            }
        },
        created () {
            this.queryCourse()
        },
        mounted () {
            this.goEquipmentInspection()
        },
        methods: {
            // 获取课程信息
            async queryCourse () {
                this.loading = true;
                const identity = this.$store.state.identity;
                const params = {
                    identity,
                    pageno: this.pageNum,
                    pagesize: this.pageSize
                };

                if (this.isRecent) {
                    Object.assign(params, {recent: 1})
                }

                let childId = '';
                if (identity === 2) {
                    await this.queryChild()
                        .then(res => {
                            let data = res.data;
                            if (data.code === 200) {
                                childId = data.data.data[0].id
                            }
                        })
                        .catch(() => {

                        })
                }

                if (childId) {
                    Object.assign(params, {child_id: childId})
                }

                this.$axios.get(this.rootUrl + '/v1/classRoom/queryClassSchedule', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.loading = false;
                            this.totalCount = data.data.count;
                            this.courseList = data.data.data;
                        }
                    })
                    .catch(() => {

                    })
            },

            // 查询课堂信息
            queryClassInfo (classInfo, type) {
                const params = {id: classInfo.id};
                this.$axios.get(this.rootUrl + '/v1/classRoom/queryClassRoomInfo', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.roomId = data.data.data.room_no;
                            if (type === 'goLive') {
                                this.goLiveBroadcast(`liveForTeacher/${classInfo.id}/${this.roomId}/${this.userId}/${classInfo['courseware_no']}/${classInfo['class_name']}/${this.userName}`)
                            }else if (type === 'resetClass') {
                                this.resetClass()
                            }
                        }
                    })
                    .catch(() => {

                    })
            },

            // 重置课堂
            resetClass () {
                this.$confirm({
                    title: '重置课堂将会还原课堂至初始状态，是否继续?',
                    content: '',
                    centered: true,
                    okText: '继续',
                    width: 450,
                    onOk:async () => {
                        this.noSave = true;
                        const res = await this.clearCoursewareProgress()
                        if (res && res.data.code === 200) {
                            localStorage.removeItem('9manLiveBroadcast');
                            this.$message.success('清除成功')
                        }else {
                            this.$message.error('清除失败')
                        }
                    },
                    onCancel() {},
                });
            },

            // 清除课件进度
            clearCoursewareProgress () {
                const params = {
                    roomId: this.roomId
                }
                return this.$axios.get(this.$store.state.emptyRoomUrl + '/restartRoom', {params}).catch(() => {})
            },

            // 查询孩子
            queryChild () {
                return this.$axios.get( this.rootUrl + '/v1/child/queryChild')
            },

            // 页码改变
            onPageChange (page) {
                this.pageNum = page;
                this.queryCourse()
            },

            goLiveBroadcast (address) {
                let routeData = this.$router.resolve({
                    path: '/' + address
                });
                window.open(routeData.href, 'live');
            },

            // 格式化日期
            formatterDate (date) {
                return moment(date).format('YYYY-MM-DD HH:mm')
            },

            formatterWeek (date) {
                return moment(date).format('dddd')
            },

            // 前往硬件检测页面
            goEquipmentInspection () {
                const equipmentInspection = common.getLocalStorage('equipmentInspection')
                if (!equipmentInspection) {
                    this.$confirm({
                        title: '你还没有完成硬件检测，是否立即前往?',
                        okText: '前往',
                        cancelText: '取消',
                        centered: true,
                        onOk:() => {
                            this.$router.push('/personalCenter/equipment_inspection');
                        },
                        onCancel() {
                            console.log('Cancel');
                        },
                    });
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    @import "../../less/index.less";
    .course-container {
        overflow: hidden;
        background:rgba(255,255,255,1);
        border-radius:6px;
        .course-box {
            > .title {
                height: 60px;
                border-bottom: 1px solid #F4F5F7;
                padding-left: 17px;
                font-size:18px;
                font-weight:normal;
                color:rgba(67,67,67,1);
                margin-bottom: 0;
                span {
                    line-height: 60px;
                    vertical-align: top;
                }
                .line {
                    display: inline-block;
                    width:4px;
                    height:30px;
                    background:@themeColor;
                    border-radius:2px;
                    margin: 15px 10px 0 0;
                    vertical-align: top;
                }
            }
            header {
                height: 100px;
                line-height: 100px;
                padding-left: 50px;
                button {
                    width:133px;
                    height:44px;
                    border:1px solid #FF6A04;
                    border-radius:10px;
                    font-size: 18px;
                    color: #FF6A04;
                    margin-right: 22px;
                    &:hover {
                        background-color: #FF6A04;
                        color: #fff;
                    }
                    &.chosen {
                        background-color: #FF6A04;
                        color: #fff;
                    }
                }
            }
            main {
                background-color: #fff;
                padding: 0 30px 24px;
                min-height: 540px;
                position: relative;
                .spin {
                    position: absolute;
                    left: 50%;
                    top: 42%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }
                .no-course {
                    position: absolute;
                    left: 50%;
                    top: 42%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    img {
                        margin-bottom: 30px;
                    }
                    p {
                        margin-bottom: 0;
                    }
                }
                .course-list {
                    table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        thead {
                            tr {
                                background-color: #F4F5F7;
                                th {
                                    font-size:16px;
                                    color: #434343;
                                    height: 44px;
                                    text-align: center;
                                    font-weight: normal;
                                    padding-left: 15px;
                                    padding-right: 15px;
                                    &:first-of-type {
                                        border-radius:13px 0 0 13px;
                                    }
                                    &:last-of-type {
                                        border-radius:0 13px 13px 0;
                                    }
                                }
                            }
                        }
                        tbody {
                            tr {
                                td {
                                    font-size:16px;
                                    height: 50px;
                                    line-height: 50px;
                                    text-align: center;
                                    color: #434343;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    &.class-time {
                                        p {
                                            margin-bottom: 0;
                                            line-height: 1.2;
                                        }
                                    }
                                    &.join-class {
                                        button {
                                            width:86px;
                                            height:36px;
                                            border-radius:10px;
                                            &:first-of-type {
                                                margin-right: 20px;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .ant-pagination {
                    margin-top: 24px;
                    display: inline-block;
                    float: right;
                    font-size: 16px;
                }
            }
        }

    }

</style>
