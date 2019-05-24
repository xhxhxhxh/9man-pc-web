
const Common = {};
/**
 * 存储LocalStorage
 */
Common.setLocalStorage = (key, value) =>{
    const params = JSON.stringify(value);
    localStorage.setItem(key, params);
};

/**
 * 读取LocalStorage
 */
Common.getLocalStorage = (key) =>{
    return JSON.parse(localStorage.getItem(key) || '[]');
};


 export default Common