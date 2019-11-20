import Home from '@/views/home/Home';
import Login from '@/views/login/Login';
import ReservingCourse from '@/views/reservingCourse/ReservingCourse';
import Users from '@/views/users/Users';
import ResetPassword from '@/views/resetPassword/ResetPassword';
import Register from '@/views/register/Register';
import page404 from '@/views/404/404';

export const mode = 'hash' // history

export const constantRouterMap = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/login', component: Login },
    { path: '/reserveCourse', component: ReservingCourse },
    { path: '/users', component: Users },
    { path: '/resetPassword', component: ResetPassword },
    { path: '/register', component: Register },
    { path: '/404', component: page404 }

];
