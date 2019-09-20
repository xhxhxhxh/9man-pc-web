<template>
    <div class="speaker-container">
        <div></div>
    </div>
</template>

<script>
    export default {
        name: "Speaker"
    }
</script>

<style lang="less" scoped>
    .speaker-container {
        width: 16px;
        height: 19px;
        display: inline-block;
        div {
            height: 18px;
            background: url("./images/speakerStatus.png") no-repeat center;
            padding-top: 1px;
        }
    }

</style>
