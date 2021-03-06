import Home from '@/views/home/Home';
import Login from '@/views/login/Login';
import ReservingCourse from '@/views/reservingCourse/ReservingCourse';
import Users from '@/views/users/Users';
import ResetPassword from '@/views/resetPassword/ResetPassword';
import Register from '@/views/register/Register';
import page404 from '@/views/404/404';
import Agreement from '@/views/agreement/Agreement';

const env = process.env.NODE_ENV;
export const mode = env === 'production'? 'history': 'hash'; // history

export const constantRouterMap = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/agreements/:mode', component: Agreement },
    { path: '/login', component: Login },
    { path: '/reserveCourse', component: ReservingCourse },
    { path: '/users', component: Users },
    { path: '/resetPassword', component: ResetPassword },
    { path: '/register', component: Register },
    { path: '/404', component: page404 }

];
