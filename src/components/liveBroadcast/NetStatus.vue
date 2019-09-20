<template>
    <div class="netStatus-container">
        <span :class="{active: isActive}"></span>
        <span :class="{active: isActive}"></span>
        <span :class="{active: isActive}"></span>
        <span :class="{active: isActive}"></span>
    </div>
</template>

<script>
    export default {
        name: "NetStatus",
        data () {
            return {
                isActive: true
            }
        }
    }
</script>

<style lang="less" scoped>
    .netStatus-container {
        width: 21px;
        height: 16px;
        font-size: 0;
        display: inline-block;
        span {
            display: inline-block;
            width: 3px;
            background-color: #FECEA8;
            &.active {
                background-color: #FF8A3A;
            }
            &:nth-child(1) {
                height: 7px;
                & ~ span {
                    margin-left: 3px;
                }
            }
            &:nth-child(2) {
                height: 10px;
            }
            &:nth-child(3) {
                height: 13px;
            }
            &:nth-child(4) {
                height: 16px;
            }
        }

    }
</style>
