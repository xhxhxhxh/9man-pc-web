import Layout from '@/views/personalCenter/Layout';
import Course from '@/views/personalCenter/Course';
import CourseForStudent from '@/views/personalCenter/CourseForStudent';
import UpdateStudentInfo from '@/views/personalCenter/UpdateStudentInfo';
import Salary from '@/views/personalCenter/Salary';
import EquipmentInspection from '@/views/personalCenter/EquipmentInspection';
import Setting from '@/views/personalCenter/Setting';

const routerMap = {};
routerMap.student = [
    {
        path: '/personalCenter',
        component: Layout,
        redirect: '/personalCenter/course',
        children: [
            { path: 'course', component: CourseForStudent, meta: {title: '课程', icon: 'iconkecheng'} },
            { path: 'salary', component: Salary, meta: {title: '订单', icon: 'iconorder'} },
            { path: 'setting', component: Setting, meta: {title: '账户设置', icon: 'icontixingshezhix'} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '硬件检测', icon: 'iconruqinjianceintrusiondetection'} },
            { path: 'updateStudentInfo/:kidId', component: UpdateStudentInfo, meta: {hidden: true} },
        ]
    },
    { path: '/liveBroadcastForStudent/:roomId/:teacherId/:studentId/:coursewareId/:name', component: () => import('@/views/liveBroadcast/liveBroadcastForStudent-v2') },
    {path: '*', redirect: '/404'}
];
routerMap.teacher = [
    {
        path: '/personalCenter',
        component: Layout,
        redirect: '/personalCenter/course',
        children: [
            { path: 'course', component: Course, meta: {title: '课程', icon: 'iconkecheng'} },
            { path: 'salary', component: Salary, meta: {title: '薪酬', icon: 'iconmoney'} },
            { path: 'setting', component: Setting, meta: {title: '账户设置', icon: 'icontixingshezhix'} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '硬件检测', icon: 'iconruqinjianceintrusiondetection'} },
        ]
    },
    { path: '/liveBroadcastForTeacher/:roomId/:teacherId/:coursewareId/:name', component: () => import('@/views/liveBroadcast/LiveBroadcastForTeacher-v2') },
    {path: '*', redirect: '/404'}
];
export default routerMap
