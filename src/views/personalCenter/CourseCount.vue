<template>
    <div class="courseCount-container">
        <header>
            <div class="line"></div>
            <span>课时</span>
            <div class="switch-area">
                <span :class="{active: mode === 'myCourseCount'}" @click="switchMode('myCourseCount')">我的课时</span>
                <span :class="{active: mode === 'purchaseHistory'}" @click="switchMode('purchaseHistory')">购买记录</span>
            </div>
        </header>
        <main>
            <div class="myCourseCount-area" v-show="mode === 'myCourseCount'">
                <div class="courseCount-info">
                    <div class="formal">
                        <p>正式课时</p>
                        <div class="count">
                            <span>{{courseCountInfo.recharge_balance}}</span>
                            <span class="slash">/</span>
                            <span>{{courseCountInfo.recharge_total - courseCountInfo.recharge_balance}}</span>
                        </div>
                        <div class="text">剩余 / 已用</div>
                    </div>
                    <div class="handsel">
                        <p>赠送课时</p>
                        <div class="count">
                            <span>{{courseCountInfo.free_balance}}</span>
                            <span class="slash">/</span>
                            <span>{{courseCountInfo.free_total - courseCountInfo.free_balance}}</span>
                        </div>
                        <div class="text">剩余 / 已用</div>
                    </div>
                </div>
                <div class="sell">
                    <div class="sell-area">
                        <div :class="{'sell-box': true, selected: productSelected.id === item.id}" v-for="item in productList" :key="item.id"
                             @click="productSelected = item">
                            <div class="count">{{item.count}}课时</div>
                            <div class="price">售价{{item.count * item.unit_price}}元</div>
                            <div class="selected-status">
                                <img src="./images/select.png" alt="">
                            </div>
                        </div>
                    </div>
                    <div class="button-area">
                        <a-button size="large" type="primary" @click="aliPay">立即购买</a-button>
                        <p>暂只支持支付宝支付，其他支付方式联系教务顾问</p>
                    </div>
                </div>
            </div>
            <div class="purchaseHistory-area clearFix" v-show="mode === 'purchaseHistory'">
                <div class="spin" v-show="loading">
                    <a-spin tip="正在查询购买记录，请稍后..."></a-spin>
                </div>
                <div class="table-area" v-show="!loading">
                    <table>
                        <thead>
                        <tr>
                            <th>购买时间</th>
                            <th>课时类型</th>
                            <th>购买数量</th>
                            <th>支付金额</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in orderList" :key="item.id">
                            <td>{{ item['create_time'] }}</td>
                            <td>{{ item['type'] ? '正式课时' : '赠送课时' }}</td>
                            <td>{{ item['count'] }}</td>
                            <td>{{ item['payment'] }}</td>
                        </tr>
                        </tbody>
                    </table>
                    <p class="noData" v-if="noData">还没有购买记录</p>
                    <a-pagination showQuickJumper :current="pageNum" :total="totalCount" @change="onPageChange"
                                  :defaultPageSize="pageSize" size="small"/>
                </div>
            </div>
        </main>
        <a-modal
                v-model="payModelVisible"
                :centered="centered"
                class="pay-model"
                width="400"
                :footer="null"
                :maskClosable="closable">
            <div class="warn">
                <div class="icon">
                    <img src="./images/warn.png" alt="" v-show="!needHelp">
                    <img src="./images/error.png" alt="" v-show="needHelp">
                </div>
                <p class="bold">{{needHelp ? '建议您立刻联系教务老师帮助处理' : '请在您新打开的页面上完成付款'}}</p>
                <p>{{needHelp ? '联系电话：15558067572' : '完成付款后请根据您的情况点击下面的按钮'}}</p>
                <div class="btn-box">
                    <a-button @click="() => {closeModel(); mode = 'purchaseHistory'}" type="primary" v-show="!needHelp">已完成支付</a-button>
                    <a-button @click="closeModel" type="primary" v-show="needHelp">我知道了</a-button>
                    <a-button @click="needHelp = true" v-show="!needHelp" class="default-color">付款遇到问题</a-button>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script>
    export default {
        name: "CourseCount",
        data () {
            return {
                rootUrl: this.$store.state.apiUrl,
                mode: 'myCourseCount',
                orderList: [],
                pageNum: 1,
                pageSize: 10,
                totalCount: 0,
                productSelected: {}, // 当前选中的产品
                productList: [],
                courseCountInfo: {recharge_balance: 0, recharge_total: 0, free_balance: 0, free_total: 0},
                noData: false, // 没有购买数据时使用
                payModelVisible: false,
                closable: false,
                centered: true,
                needHelp: false
            }
        },
        created () {
            this.queryOrderInfo()
            this.queryCourseCount()
            this.queryProduct()
        },
        watch: {
            mode: function (newMode) {
                if (newMode === 'purchaseHistory') {
                    this.noData = false
                    this.pageNum = 1
                    this.queryOrderInfo()
                } else {
                    this.queryCourseCount()
                }
            }
        },
        methods: {
            // 切换mode
            switchMode (mode) {
                this.mode = mode
            },

            // 查询订单信息
            queryOrderInfo () {
                this.loading = true
                const params = {
                    pageno: this.pageNum,
                    pagesize: this.pageSize
                }
                this.$axios.get(this.rootUrl + '/v1/orderInfo/queryOrderInfo', {params})
                    .then(res => {
                        let data = res.data
                        this.loading = false
                        if (data.code === 200) {
                            this.totalCount = data.data.count
                            this.orderList = data.data.data
                            if (this.orderList.length === 0) {
                                this.noData = true
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        this.loading = false
                    })
            },

            // 查询课时
            queryCourseCount () {
                this.$axios.get(this.rootUrl + '/v1/classhour/queryClasshour')
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.courseCountInfo = data.data.data
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            },

            // 查询产品
            queryProduct () {
                this.$axios.get(this.rootUrl + '/v1/classhour/queryProduct')
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            this.productList = data.data.data
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            },

            // 页码改变
            onPageChange (page) {
                this.pageNum = page
                this.queryOrderInfo()
            },

            // 支付
            aliPay () {
                const id = this.productSelected.id
                if (!id) {
                    this.$message.warning('请选择要购买的课时')
                    return
                }

                const params = {
                    product_id: id
                }
                this.$axios.post(this.rootUrl + '/v1/Pay/orderAlipay', params)
                    .then(res => {
                        const newTab = window.open();
                        const div = document.createElement('div');
                        div.innerHTML = res.data; // html code
                        newTab.document.body.appendChild(div);
                        newTab.document.forms.alipay_submit.submit();
                        this.needHelp = false
                        this.payModelVisible = true
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            },

            // 关闭支付提醒弹窗
            closeModel () {
                this.payModelVisible = false
            }
        }
    }
</script>

<style lang="less">
    @import "../../less/index.less";
    .courseCount-container {
        background-color: #F4F5F7;
        border-radius:6px;
        overflow: hidden;
        header {
            background-color: #fff;
            height: 60px;
            border-bottom: 1px solid #F4F5F7;
            padding-left: 17px;
            font-size:18px;
            color:rgba(67,67,67,1);
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
            .switch-area {
                float: right;
                user-select: none;
                padding: 0 18px;
                span {
                    cursor: pointer;
                    &.active {
                        color: @themeColor;
                    }
                    &:first-of-type {
                        margin-right: 58px;
                    }
                }
            }
        }
        main {
            .myCourseCount-area {
                .courseCount-info {
                    background-color: #fff;
                    height: 180px;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    text-align: center;
                    color: #434343;
                    border-radius: 0 0 6px 6px;
                    p {
                        font-size:16px;
                        margin-bottom: 22px;
                    }
                    .count {
                        font-size:36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        .slash {
                            font-size: 16px;
                            margin: 0 7px;
                        }
                    }
                    .text {
                        font-size: 12px;
                    }
                }
                .sell {
                    user-select: none;
                    margin-top: 20px;
                    .sell-area {
                        display: flex;
                        justify-content: space-between;
                        .sell-box {
                            position: relative;
                            cursor: pointer;
                            width:300px;
                            height:200px;
                            background:#fff;
                            border-radius:6px;
                            color: #434343;
                            display: flex;
                            justify-content: center;
                            flex-direction: column;
                            overflow: hidden;
                            .count {
                                font-size: 26px;
                                text-align: center;
                                margin-bottom: 8px;
                            }
                            .price {
                                font-size: 16px;
                                margin-bottom: 0;
                                text-align: center;
                            }
                            .selected-status {
                                display: none;
                            }
                            &.selected {
                                border: 1px solid @themeColor;
                                .selected-status {
                                    transform: rotate(45deg) translate(70%, 0);
                                    display: flex;
                                    position: absolute;
                                    width: 60px;
                                    height: 60px;
                                    background-color: @themeColor;
                                    bottom: 0;
                                    right: 0;
                                    align-items: center;
                                    img {
                                        width: 15px;
                                        vertical-align: top;
                                        transform: rotate(-45deg);
                                        margin-left: 3px;
                                    }
                                }
                            }
                        }
                    }
                }
                .button-area {
                    text-align: center;
                    margin-top: 18px;
                    button {
                        width:210px;
                        height:50px;
                        border-radius:10px;
                        font-size: 16px;
                        color: #fff;
                        text-shadow: unset;
                    }
                    p {
                        font-size:12px;
                        color: #434343;
                        margin-top: 7px;
                        margin-bottom: 0;
                    }
                }
            }
            .purchaseHistory-area {
                background-color: #fff;
                position: relative;
                padding: 0 30px 24px;
                overflow: hidden;
                min-height: 183px;
                .spin {
                    position: absolute;
                    left: 50%;
                    top: 42%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }
                .ant-pagination {
                    margin-top: 24px;
                    display: inline-block;
                    float: right;
                    font-size: 16px;
                }
                .noData {
                    text-align: center;
                    line-height: 50px;
                    margin-bottom: 0;
                }
                table {
                    margin-top: 15px;
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

                            }
                        }
                    }
                }
            }
        }
    }
    .pay-model {
        width: 400px;
        .ant-modal-content {
            border:4px solid @themeColor;
            border-radius:20px;
        }
        .ant-modal-body {
            padding-top: 28px;
            height: 242px;
            .warn {
                p {
                    text-align: center;
                    margin-bottom: 0;
                    font-size: 14px;
                    color: #808080;
                    &.bold {
                        margin-top: 5px;
                        font-size:16px;
                        color: #434343;
                        font-weight: bold;
                    }
                }
                .icon {
                    text-align: center;
                    img {
                        vertical-align: middle;
                        width: 71px;
                    }
                }
                .btn-box {
                    margin-top: 24px;
                    text-align: center;
                    button {
                        width:138px;
                        height:50px;
                        border-radius:10px;
                        font-size: 16px;
                        text-shadow: unset;
                        &.default-color {
                            color: @themeColor;
                            border: 1px solid @themeColor;
                        }
                        &:first-of-type {
                            margin-right: 50px;
                        }
                    }
                }
            }
        }
    }
</style>
