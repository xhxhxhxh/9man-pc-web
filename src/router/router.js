import VueRouter from 'vue-router';
import Layout from '@/views/layout/Layout';
import Login from '@/views/login/Login';

const constantRouterMap = [
    { path: '/', redirect: '/home' },
    {
        path: '/home',
        redirect: '/home/login',
        component: Layout,
        children: [
            { path: 'login', component: Login}
        ] },
];

const router = new VueRouter ({
    // mode: 'history',
    routes: constantRouterMap,
});

export default router;