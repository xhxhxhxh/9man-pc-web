import Layout from '@/views/personalCenter/Layout';
import Course from '@/views/personalCenter/Course';
import CourseForStudent from '@/views/personalCenter/CourseForStudent';
import UpdateStudentInfo from '@/views/personalCenter/UpdateStudentInfo';
import Salary from '@/views/personalCenter/Salary';
import EquipmentInspection from '@/views/personalCenter/EquipmentInspection';
import Setting from '@/views/personalCenter/Setting';
import CourseCount from '@/views/personalCenter/CourseCount';

const routerMap = {};
routerMap.student = [
    {
        path: '/personalCenter',
        component: Layout,
        redirect: '/personalCenter/course',
        children: [
            { path: 'course', component: CourseForStudent, meta: {title: '课程', icon: 'iconkecheng'} },
            { path: 'courseCount', component: CourseCount, meta: {title: '课时', icon: 'iconorder'} },
            { path: 'setting', component: Setting, meta: {title: '账户设置', icon: 'icontixingshezhix'} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '硬件检测', icon: 'iconruqinjianceintrusiondetection'} },
            { path: 'updateStudentInfo/:kidId', component: UpdateStudentInfo, meta: {hidden: true} },
        ]
    },
    { path: '/liveForStudent/:classId/:role/:roomId/:teacherId/:studentId/:coursewareId/:classname/:name', component: () => import('@/views/live/LiveForStudent'), name: 'live' },
    { path: '*', redirect: '/404'}
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
    { path: '/liveForTeacher/:classId/:roomId/:teacherId/:coursewareId/:classname/:name', component: () => import('@/views/live/LiveForTeacher'), name: 'live' },
    { path: '/liveForStudent/:classId/:role/:roomId/:teacherId/:studentId/:coursewareId/:classname/:name', component: () => import('@/views/live/LiveForStudent') },
    { path: '*', redirect: '/404'}
];
export default routerMap
