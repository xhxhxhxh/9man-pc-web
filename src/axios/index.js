import Axios from 'axios';

const AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJKRzc5UkU2TyIsImlhdCI6MTU3MzQ1NDc0OCwibmJmIjoxNTczNDU0NzQ4LCJleHAiOjE1NzQwNTk1NDh9.9EIApRpAL-J-6XrvF68jlm-7qygpy5-sXWx6WpAdZPQ"
Axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;

Axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么

    return response;
}, function (error) {
    // 对响应错误做点什么

    return Promise.reject(error);
});
// 添加请求拦截器
Axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


export default Axios;
