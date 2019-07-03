// import './css/font-awesome.min.css';
import Vue from 'vue';
import VueRouter from 'vue-router';
import router from '@/router/router';
import app from './app.vue';
import axios from 'axios'
import store from '@/store';
import './permission';
import 'normalize.css';
import './css/base.css';
import { Button, Menu, Form, Input, Modal, message, Select, DatePicker, LocaleProvider, TimePicker, Popover, Icon, Slider, Upload } from 'ant-design-vue';

Vue.config.productionTip = false;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = false;
Vue.prototype.$axios= axios;
Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$success = Modal.success;

//全局组件
// Vue.component(Button.name, Button);
Vue.use(Button);
Vue.use(Menu);
Vue.use(Form);
Vue.use(Input);
Vue.use(Modal);
Vue.use(Select);
Vue.use(DatePicker);
Vue.use(LocaleProvider);
Vue.use(TimePicker);
Vue.use(Popover);
Vue.use(Icon);
Vue.use(Slider);
Vue.use(Upload);


Vue.use(VueRouter);

//聚焦效果
Vue.directive('focus',{
    inserted: function (el) {
        el.focus();
    }
});

new Vue({
    el: '#app',
    data: {
        message: '哈哈哈'
    },
    render: c => c(app),
    router,
    store
});
