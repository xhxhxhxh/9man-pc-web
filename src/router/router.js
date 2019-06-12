import VueRouter from 'vue-router';
import Home from '@/views/home/Home';
import Login from '@/views/login/Login';
import Layout from '@/views/myCourse/Layout';
import MyCourse from '@/views/myCourse/MyCourse';
import MakeUpCourse from '@/views/myCourse/MakeUpCourse';
import ReserveCourse from '@/views/myCourse/ReserveCourse';
import ReservingCourse from '@/views/reservingCourse/ReservingCourse';
import Users from '@/views/users/Users';

const constantRouterMap = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/login', component: Login },
    {
        path: '/course',
        component: Layout,
        redirect: '/course/myCourse',
        children: [
            { path: 'myCourse', component: MyCourse },
            { path: 'makeUpCourse', component: MakeUpCourse },
            { path: 'reserveCourse', component: ReserveCourse }
        ]
    },
    { path: '/reserveCourse', component: ReservingCourse },
    { path: '/users', component: Users },
];

const router = new VueRouter ({
    // mode: 'history',
    routes: constantRouterMap,
});

export default router;