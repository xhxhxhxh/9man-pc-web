
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
    return JSON.parse(localStorage.getItem(key) || '[]');
};


 export default common
