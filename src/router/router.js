import VueRouter from 'vue-router';
import Home from '@/views/home/Home';
import Login from '@/views/login/Login';
import ReservingCourse from '@/views/reservingCourse/ReservingCourse';
import Users from '@/views/users/Users';
import ResetPassword from '@/views/users/ResetPassword';


const constantRouterMap = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/login', component: Login },
    { path: '/reserveCourse', component: ReservingCourse },
    { path: '/users', component: Users },
    { path: '/resetPassword', component: ResetPassword },
];

const router = new VueRouter ({
    // mode: 'history',
    routes: constantRouterMap,
});

export default router;
