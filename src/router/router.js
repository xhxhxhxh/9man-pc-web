import VueRouter from 'vue-router';
import Home from '@/views/home/Home';
import Login from '@/views/login/Login';
import ReservingCourse from '@/views/reservingCourse/ReservingCourse';
import Users from '@/views/users/Users';
import ResetPassword from '@/views/resetPassword/ResetPassword';
import Register from '@/views/register/Register';
import page404 from '@/views/404/404';
import LiveBroadcastForTeacher from '@/views/liveBroadcast/LiveBroadcastForTeacher-v2';
import LiveBroadcastForStudent from '@/views/liveBroadcast/liveBroadcastForStudent-v2';
// import LiveBroadcastForTeacher from '@/views/liveBroadcast/LiveBroadcast';
// import LiveBroadcastForStudent from '@/views/liveBroadcast/liveBroadcast2';

const constantRouterMap = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/login', component: Login },
    { path: '/reserveCourse', component: ReservingCourse },
    { path: '/users', component: Users },
    { path: '/resetPassword', component: ResetPassword },
    { path: '/register', component: Register },
    { path: '/liveBroadcastForTeacher', component: LiveBroadcastForTeacher },
    { path: '/liveBroadcastForStudent', component: LiveBroadcastForStudent },
    { path: '/404', component: page404 }
    // {path: '*', redirect: '/404', hidden: true}
];

const router = new VueRouter ({
    // mode: 'history',
    routes: constantRouterMap,
});

export default router;
