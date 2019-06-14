import MyCourse from '@/views/myCourse/MyCourse';
import MakeUpCourse from '@/views/myCourse/MakeUpCourse';
import ReserveCourse from '@/views/myCourse/ReserveCourse';
import TeacherCourse from '@/views/adminManage/TeacherCourse';
import StatisticalSettlement from '@/views/adminManage/StatisticalSettlement';
import StatisticalDetails from '@/views/adminManage/StatisticalDetails';
import Layout from '@/views/myCourse/Layout';
import TeacherLayout from '@/views/adminManage/Layout';

const routerMap = {};
routerMap.student = {
    path: '/course',
    component: Layout,
    redirect: '/course/myCourse',
    children: [
        { path: 'myCourse', component: MyCourse, meta: {title: '我的课程'} },
        { path: 'makeUpCourse', component: MakeUpCourse, meta: {title: '补课课程'} },
        { path: 'reserveCourse', component: ReserveCourse, meta: {title: '预约补课'} },
    ]
};
routerMap.teacher = {
    path: '/adminManage',
    component: TeacherLayout,
    redirect: '/adminManage/teacherCourse',
    children: [
        { path: 'teacherCourse', component: TeacherCourse, meta: {title: '我的课程'} },
        { path: 'statisticalSettlement', component: StatisticalSettlement, meta: {title: '统计结算'} },
        { path: 'statisticalDetails', component: StatisticalDetails, meta: {title: '统计明细'} }
    ]
};
export default routerMap
