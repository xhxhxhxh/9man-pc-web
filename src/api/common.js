
const common = {};
/**
 * 存储LocalStorage
 */
common.setLocalStorage = (key, value) =>{
    const params = JSON.stringify(value);
    localStorage.setItem(key, params);
};

/**
 * 读取LocalStorage
 */
common.getLocalStorage = (key) =>{
    const value = localStorage.getItem(key);
    if (value) {
        return JSON.parse(localStorage.getItem(key));
    } else {
        return '';
    }
};

/**
 * 获取浏览器信息
 */
common.getBrowserInfo = () => {
    const Sys = {};
    const ua = navigator.userAgent.toLowerCase();
    const re = /(msie|firefox|chrome|opera|version|trident|edge).*?([\d.]+)/;
    const m = ua.match(re);
    Sys.browser = m[1].replace(/version/, "'safari");
    Sys.ver = m[2];
    return Sys;
}

 export default common
