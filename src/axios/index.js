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
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJQS0U1MjhFUSIsImlhdCI6MTU3MjU5NDkzOSwibmJmIjoxNTcyNTk0OTM5LCJleHAiOjE1NzMxOTk3Mzl9.HpgwMDaylP4TKo4zBKIbewL97O0ACVB_H3ySI9M8d0A";
    if (token) {
        config.headers.Authorization = token
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


export default Axios;
