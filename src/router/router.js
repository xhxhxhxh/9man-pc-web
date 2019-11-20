import {constantRouterMap, mode} from './routerList';
import VueRouter from 'vue-router'

const router = new VueRouter ({
    mode,
    routes: constantRouterMap,
});

export default router;
