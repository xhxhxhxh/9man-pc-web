<template>
    <div class="browserTest-container">
        <p>{{data.warning}}</p>
        <img src="../../home/images/chrome.png" alt="">
        <a-button type="primary" @click="skipChromeSite">下载浏览器</a-button>
    </div>
</template>

<script>
    export default {
        name: "BrowserTest",
        props: ['data'],
        methods: {
            // 前往谷歌浏览器页面
            skipChromeSite () {
                window.open('https://www.google.cn/chrome/')
            }
        }
    }
</script>

<style lang="less" scoped>
    .browserTest-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        padding: 0 40px 40px;
        height: 300px;
        p {
            margin: 0;
            font-size:18px;
            color: #434343;
            text-align: center;
        }
        img {
            display: block;
            width: 94px;
        }
        button {
            width:190px;
            height:55px;
            border-radius:28px;
            font-size:18px;
            color: #fff;
        }
    }
</style>
