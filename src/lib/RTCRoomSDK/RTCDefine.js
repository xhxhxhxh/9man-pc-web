/**
 * Created by songtao on 2019/7/22.
 */


let RTC_DEVICE_ERROR = {
    NotFoundError: '未找到设备',
    NotReadableError: '设备被占用',
    OverconstrainedError: '设备不支持',
    NotAllowedError: '设备未授权',
    TypeError: '类型错误',
    AbortError: '硬件错误'
  };

let RTC_USER_ROLE = {
  Teacher: 1,  //老师
  Student: 2,  //学生
  Visitor: 3,  //旁听
  Invisible: 4 //隐身
};

let RTC_ERROR_MSG = {
  Success: '正常',
  Not_Initialized: '没有初始化',
  Bad_Parameters: '参数错误',
  ConnectSocket_Error: '服务器连接失败',
  ConnectSocket_Disconnect: '服务器断开连接',
  ConnectSocket_Reconnect: '服务器重新连接',
  MessageFormat_Error: '消息格式错误',
  Undefined_Error: '对象不存在',
  Kick_Out: '你已被通知下线',
  VideoAccess_Failed: '请求获取麦克风权限失败',
  AudioAccess_Failed: '请求获取摄像头权限失败',
  Microphone_Disable: '麦克风不可用',
  Camera_Disable: '摄像头不可用',
};

export {
  RTC_DEVICE_ERROR,
  RTC_USER_ROLE,
  RTC_ERROR_MSG
};
