<template>
    <div class="layout-container">
        <TopBar></TopBar>
        <router-view></router-view>
    </div>
</template>

<script>
    import TopBar from '@/components/TopBar/TopBar';
    export default {
        name: "Layout",
        components: {
            TopBar
        }
    }
</script>

<style scoped>

</style>