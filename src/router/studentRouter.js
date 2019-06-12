import MyCourse from '@/views/myCourse/MyCourse';
import MakeUpCourse from '@/views/myCourse/MakeUpCourse';
import ReserveCourse from '@/views/myCourse/ReserveCourse';
export default [
    { path: 'myCourse', component: MyCourse, meta: {title: '我的课程'} },
    { path: 'makeUpCourse', component: MakeUpCourse, meta: {title: '补课课程'} },
    { path: 'reserveCourse', component: ReserveCourse, meta: {title: '预约补课'} }
]