import Axios from 'axios';

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
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJQS0U1MjhFUSIsImlhdCI6MTU3Mjg0MDY4MSwibmJmIjoxNTcyODQwNjgxLCJleHAiOjE1NzM0NDU0ODF9.CRFVyOjduU9xKJd6ep4QFNZMSX1Rv2tNPBQv2Kkl8RI";
    if (token) {
        config.headers.Authorization = token
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


export default Axios;
