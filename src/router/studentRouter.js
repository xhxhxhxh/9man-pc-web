import MyCourse from '@/views/myCourse/MyCourse';
import MakeUpCourse from '@/views/myCourse/MakeUpCourse';
import ReserveCourse from '@/views/myCourse/ReserveCourse';
import TeacherCourse from '@/views/adminManage/TeacherCourse';
import StatisticalSettlement from '@/views/adminManage/StatisticalSettlement';
import StatisticalDetails from '@/views/adminManage/StatisticalDetails';
import Layout from '@/views/personalCenter/Layout';
import Course from '@/views/personalCenter/Course';
import CourseForStudent from '@/views/personalCenter/CourseForStudent';
import Salary from '@/views/personalCenter/Salary';
import EquipmentInspection from '@/views/personalCenter/EquipmentInspection';
import Setting from '@/views/personalCenter/Setting';
import LiveBroadcastForTeacher from '@/views/liveBroadcast/LiveBroadcastForTeacher-v2';
import LiveBroadcastForStudent from '@/views/liveBroadcast/liveBroadcastForStudent-v2';

import course from '@/views/personalCenter/images/course.png';
import salary from '@/views/personalCenter/images/salary.png';
import equipment_inspection from '@/views/personalCenter/images/equipment_inspection.png';
import setting from '@/views/personalCenter/images/setting.png';

const routerMap = {};
routerMap.student = [
    {
        path: '/personalCenter',
        component: Layout,
        redirect: '/personalCenter/course',
        children: [
            { path: 'course', component: CourseForStudent, meta: {title: '课程', icon: course} },
            { path: 'salary', component: Salary, meta: {title: '薪酬', icon: salary} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '账户设置', icon: equipment_inspection} },
            { path: 'setting', component: Setting, meta: {title: '硬件检测', icon: setting} },
        ]
    },
    { path: '/liveBroadcastForStudent/:roomId/:studentId/:coursewareId/:name', component: LiveBroadcastForStudent },
    {path: '*', redirect: '/404'}
];
routerMap.teacher = [
    {
        path: '/personalCenter',
        component: Layout,
        redirect: '/personalCenter/course',
        children: [
            { path: 'course', component: Course, meta: {title: '课程', icon: course} },
            { path: 'salary', component: Salary, meta: {title: '薪酬', icon: salary} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '账户设置', icon: equipment_inspection} },
            { path: 'setting', component: Setting, meta: {title: '硬件检测', icon: setting} },
        ]
    },
    { path: '/liveBroadcastForTeacher/:roomId/:teacherId/:coursewareId/:name', component: LiveBroadcastForTeacher },
    {path: '*', redirect: '/404'}
];
export default routerMap
