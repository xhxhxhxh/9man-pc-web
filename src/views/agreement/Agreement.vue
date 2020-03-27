<template>
    <div class="agreement-container">
        <TopBar></TopBar>
        <img src="./images/banner.png" alt="" class="banner">
        <main>
            <div class="nav">
                <span @click="mode = 'agreement'" :class="{active: mode === 'agreement'}">服务协议</span>
                <span @click="mode = 'privacyPolicy'" :class="{active: mode === 'privacyPolicy'}">隐私政策</span>
            </div>
            <div class="content" ref="content">
                <iframe :src="$store.state.localUrl + iframeSrc" ref="iframe" frameborder="0"></iframe>
            </div>
        </main>
    </div>
</template>

<script>
    import TopBar from '@/components/TopBar/TopBar';
    export default {
        name: "agreement",
        data () {
            return {
                mode: 'agreement',
            }
        },
        components: {
            TopBar
        },
        created () {
            this.mode = this.$route.params.mode
        },
        computed: {
            iframeSrc () {
                if (this.mode === 'agreement') {
                    return '/agreement/SoftwareAndServiceAgreement.html'
                }else if (this.mode === 'privacyPolicy'){
                    return '/agreement/privacyPolicy.html'
                }
            }
        },
        mounted() {
            this.init()
        },
        methods:{
            init () {
                const iframe = this.$refs.iframe;
                const content = this.$refs.content;

                iframe.onload = () => {
                    const dom = iframe.contentWindow.document.documentElement
                    content.style.height = dom.offsetHeight + 'px'
                }
            }
        }
    }
</script>

<style lang="less" scoped>
.agreement-container {
    background-color: #f7f7f7;
    padding-top: 70px;
    .banner {
        width: 100%;
        display: block;
        object-fit: cover;
    }
    main {
        width: 1300px;
        margin: 15px auto 0;
        .nav {
            height: 77px;
            text-align: center;
            background-color: #fff;
            border-radius: 4px;
            span {
                display: inline-block;
                width: 100px;
                height: 100%;
                line-height: 77px;
                margin-left: 20px;
                font-size: 16px;
                color: #666;
                &:hover {
                    cursor: pointer;
                }
                &.active {
                    border-bottom: 2px solid #5cc7f9;
                }
            }
        }
        .content {
            margin-top: 20px;
            background-color: #fff;
            border-radius: 4px;
            iframe {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
