import Layout from '@/views/personalCenter/Layout';
import Course from '@/views/personalCenter/Course';
import CourseForStudent from '@/views/personalCenter/CourseForStudent';
import UpdateStudentInfo from '@/views/personalCenter/UpdateStudentInfo';
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
            { path: 'setting', component: Setting, meta: {title: '账户设置', icon: equipment_inspection} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '硬件检测', icon: setting} },
            { path: 'updateStudentInfo/:kidId', component: UpdateStudentInfo, meta: {hidden: true} },
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
            { path: 'setting', component: Setting, meta: {title: '账户设置', icon: equipment_inspection} },
            { path: 'equipment_inspection', component: EquipmentInspection, meta: {title: '硬件检测', icon: setting} },
        ]
    },
    { path: '/liveBroadcastForTeacher/:roomId/:teacherId/:coursewareId/:name', component: LiveBroadcastForTeacher },
    {path: '*', redirect: '/404'}
];
export default routerMap
