/**
 * Created by songtao on 2019/7/22.
 */

import Logger from './RTCLogger';
import RTCRoom from './RTCRoom';
import RTCDevice from './RTCDevice';
import RTCRoomUser from './RTCRoomUser';
import {RTC_ERROR_MSG} from './RTCDefine';

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('RTCRoomManager');

export default class RTCRoomManager extends EventEmitter {

  constructor()
  {
    logger.debug('constructor');

    super();

    this.instance = null;

    this._rtcRoom = null;

    this._roomUsers = new Map();

    this._peerId = '';

    this._property = {};

    this._device = null;

    this._createDevice();
  }

  static getInstance() {
    if(!this.instance) {
      this.instance = new RTCRoomManager();
    }
    return this.instance;
  }

  _createDevice()
  {
    this._device = new RTCDevice();

    this._device.on('device_error',(msg) => {
      let data = {
        code: 1005,
        msg: msg
      };
      this.RTCRoomErrorNotice(data);
    });

  }

  _createRtcRoom(host,port,roomId,peerId)
  {
    let rtcRoom = new RTCRoom({host,port,roomId,peerId});

    rtcRoom.on('rtc-socket-connect',(data) => {
      this._rtcRoom.joinRoom(this._property);
    });

    rtcRoom.on('rtc-user-joined',(data) => {
      this.RTCRoomUserJoined(data);
    });

    rtcRoom.on('rtc-user-leaved',(data) => {
      this.RTCRoomUserLeaved(data);
    });

    rtcRoom.on('rtc-media-receive',(data) => {
      this.RTCRoomMediaReceive(data);
    });

    rtcRoom.on('rtc-message-receive',(data) => {
      this.RTCRoomMessageReceive(data);
    });

    rtcRoom.on('rtc-socket-message',(message) => {
      this.handleSocketMessageEvent(message);
    });

    rtcRoom.on('rtc-peer-connected',(data) => {
      this.RTCRoomPeerConnected(data);
    });

    rtcRoom.on('rtc-error-notice',(data) => {
      this.RTCRoomErrorNotice(data);
    });

    rtcRoom.on('rtc-audio-volume',(data) => {
      this.RTCRoomAudioVolume(data);
    });

    rtcRoom.on('rtc-user-stats',(data) => {
      this.RTCRoomStatsChange(data);
    });

    return rtcRoom;
  }

  //动作事件
  async joinRoom(host,port,roomId,peerId,userParams)
  {
    await this._device.checkDevice();

    this._peerId = peerId;

    this._property = this.buildUserProperty(userParams);

    this._rtcRoom = this._createRtcRoom(host,port,roomId,peerId);

    this._rtcRoom.join();
  }

  leaveRoom()
  {
    this._rtcRoom.close();
  }

  sendMessage(message,peerId)
  {
    this._rtcRoom.sendMessage(message,peerId);
  }

  notifyMessage(data,receiver)
  {
    let obj = {
      receiver: receiver,
      data: data
    };
    this.sendNotificationMessage('user_message_notify',obj);
  }

  changeUserProperty(peerId,receiver,data)
  {
    let obj = {
      peerId: peerId,
      receiver: receiver,
      property: data
    };
    this.sendNotificationMessage('user_property_change',obj);
  }

  changeAIControl(peerId)
  {
    let data = {
      peerId: peerId
    };
    this.sendRequestMessage('ai_control',data);
  }

  changeAISyncStatus(status)
  {
    let data = {
      sync: status
    };
    this.sendRequestMessage('ai_sync',data);
  }

  restartAICourseware(resource)
  {
    let data = {
      resource: resource ? resource : ''
    };
    this.sendRequestMessage('ai_restart',data);
  }

  openVideo(peerId,except)
  {
    if (!Array.isArray(except)) {
      except = [except];
    }
    if (peerId === this._peerId) {
      this.handleRoomUserVideoControl(1,except);
    }else {
      let data = {
        peerId: peerId,
        mediaType: 'video',
        status: 1,
        except: except
      };
      this.sendNotificationMessage('user_media_control',data);
    }
  }

  closeVideo(peerId,except)
  {
    if (!Array.isArray(except)) {
      except = [except];
    }
    if (peerId === this._peerId) {
      this.handleRoomUserVideoControl(0,except);
    }else {
      let data = {
        peerId: peerId,
        mediaType: 'video',
        status: 0,
        except: except
      };
      this.sendNotificationMessage('user_media_control',data);
    }
  }

  openAudio(peerId)
  {
    if (peerId === this._peerId) {
      this._rtcRoom.openAudio();
    }else {
      let data = {
        peerId: peerId,
        mediaType: 'audio',
        status: 1
      };
      this.sendNotificationMessage('user_media_control',data);
    }
  }

  closeAudio(peerId)
  {
    if (peerId === this._peerId) {
      this._rtcRoom.closeAudio();
    }else {
      let data = {
        peerId: peerId,
        mediaType: 'audio',
        status: 0
      };
      this.sendNotificationMessage('user_media_control',data);
    }
  }

  controlLocalVideo(peerId,isOpen)
  {
    if (isOpen) {
      this._rtcRoom.openVideo(peerId);
    }else {
      this._rtcRoom.closeVideo(peerId);
    }
  }

  //处理通知事件
  RTCRoomUserJoined(data)
  {
    let peerId = data.peerId;
    let properties = data.properties;

    this.initRoomUsers(properties);

    this.emit('user-joined',peerId);
  }

  RTCRoomUserLeaved(data)
  {
    let peerId = data.peerId;

    this.removeRoomUser(peerId);

    this.emit('user-leaved',peerId);
  }

  RTCRoomMediaReceive(data)
  {
    let peerId = data.peerId;
    let stream = data.stream;

    this.emit('media-receive',peerId,stream);
  }

  RTCRoomMessageReceive(data)
  {
    let message = data.message;

    if (message.event === 'audio_volume_change') {
      let peerId = message.data.peerId;
      let volume = message.data.volume;
      this.emit('audio-volume-change',peerId,volume);
    }else {
      this.emit('message-receive',message);
    }

  }

  handleSocketMessageEvent(message)
  {
    let method = message['method'];

    let data = message['data'];

    if (!method) {
      let data = {
        code: 402,
        msg: RTC_ERROR_MSG.MessageFormat_Error
      };
      this.RTCRoomErrorNotice(data);
      return;
    }

    if (message['request']) {
      this.handleRequestMessageEvent(method,data);
    }else if (message['notification']) {
      this.handleNotificationMessageEvent(method,data);
    }

  }

  RTCRoomPeerConnected(data)
  {
    let peerId = data.peerId;

    this.emit('user-peer-connected',peerId);
  }

  RTCRoomErrorNotice(data)
  {
    this.emit('error-notice',data);
  }

  RTCRoomAudioVolume(data)
  {
    let peerId = data.peerId;
    let volume = data.volume;

    this.emit('audio-volume-change',peerId,volume);

    let message = {
      event: 'audio_volume_change',
      data: {
        peerId: peerId,
        volume: volume
      }
    };

    this._rtcRoom.sendMessage(message,null);
  }

  RTCRoomStatsChange(data)
  {
    let message = {
      peerId: this._peerId,
      receiver: data.peerId,
      stats: data.stats
    };
    this.sendNotificationMessage('rtc_user_stats',message);
  }

  handleRequestMessageEvent(method,data)
  {

  }

  handleNotificationMessageEvent(method,data)
  {
    if (method === 'user_message_notify') {

      let peerId = data.peerId;
      let message = data.data;

      this.emit('message-notify-receive',peerId,message);

    }else if (method === 'user_kick_out') {
      let data = {
        code: 403,
        msg: RTC_ERROR_MSG.Kick_Out
      };
      this.RTCRoomErrorNotice(data);

      this._rtcRoom.disconnect();

    }else if (method === 'user_property_change') {

      let peerId = data.peerId;
      let property = data.property;

      let user = this.getRoomUser(peerId);
      if (user) {
        user.changeProperty(property);
      }

      this.emit('user-property-change',peerId,property);

    }else if (method === 'rtc_user_stats') {

      let peerId = data.peerId;
      let stats = data.stats;
      this.handleRoomRTCStats(stats, peerId);

    }else if (method === 'user_media_control') {

      let mediaType = data.mediaType;
      let status = data.status;
      let except = data.except;
      this.handleRoomUserMediaControl(mediaType,status,except);

    }else if (method === 'ai_start') {
      this.emit('ai-action-notify',method,data);
    }else if (method === 'ai_result') {
      this.emit('ai-action-notify',method,data);
    }
  }

  //消息格式管理
  sendRequestMessage(method,data) {
    const request =
            {
              request      : true,
              method       : method,
              data         : data || {}
            };

    this._rtcRoom.socketEmit('message',request);
  }

  sendNotificationMessage(method,data) {
    const notification =
            {
              notification : true,
              method       : method,
              data         : data || {}
            };

    this._rtcRoom.socketEmit('message',notification);
  }

  //RoomUser管理
  initRoomUsers(properties)
  {
    let that = this;
    Object.keys(properties).forEach(function(key){
      let value = properties[key];
      that.createRoomUser(key,value);
    });
  }

  createRoomUser(peerId,property)
  {
    let roomUser = this.getRoomUser(peerId);

    if (!roomUser) {
      let user = new RTCRoomUser({peerId,property});
      this._roomUsers.set(peerId,user);
    }
  }

  getRoomUser(peerId)
  {
    return this._roomUsers.get(peerId);
  }

  removeRoomUser(peerId)
  {
    this._roomUsers.delete(peerId);
  }

  getAllRoomUser()
  {
    return [...this._roomUsers.values()];
  }

  buildUserProperty(userParams)
  {
    let property = userParams ? userParams : {};

    if (!property.hasOwnProperty('name')) {
      property['name'] = '';
    }

    if (!property.hasOwnProperty('role')) {
      property['role'] = 0;

      let data = {
        code: 102,
        msg: RTC_ERROR_MSG.Bad_Parameters
      };
      this.RTCRoomErrorNotice(data);

    }

    property['peerId'] = this._peerId;
    property['device'] = this._device.deviceState;

    return property;
  }

  handleRoomUserMediaControl(mediaType,status,except)
  {
    if (mediaType === 'video') {
      this.handleRoomUserVideoControl(status,except);
    }else if (mediaType === 'audio') {
      this.handleRoomUserAudioControl(status);
    }else {
      logger.error('media type error');
    }
  }

  handleRoomUserVideoControl(status,except)
  {
    let peerIds = [...this._roomUsers.keys()];

    for (let i = 0; i < peerIds.length; i++) {
      let peerId = peerIds[i];
      if (except.indexOf(peerId) > -1 || peerId === this._peerId) {
        continue;
      }

      if (status === 1) {
        this._rtcRoom.openVideo(peerId);
      }else {
        this._rtcRoom.closeVideo(peerId);
      }
    }
  }

  handleRoomUserAudioControl(status)
  {
    if (status === 1) {
      this._rtcRoom.openAudio();
    }else {
      this._rtcRoom.closeAudio();
    }
  }

  handleRoomRTCStats(stats, peerId)
  {
    let audioStats = this.getAudioStats(stats.audio);

    let videoStats = this.getVideoStats(stats.video);

    this.emit('rtc-user-stats',peerId,audioStats,videoStats);
  }

  getAudioStats(stats)
  {
    let packetLossRate;
    if (stats.packetsSent === 0) {
      packetLossRate = 0;
    }else {
      packetLossRate = stats.packetsLost/stats.packetsSent;
    }

    let netLevel = this.getNetlevel(packetLossRate);

    let audioStats = {
      bitrate         : stats.bitrate,
      packetLossRate  : packetLossRate,
      latency         : stats.latency,
      jitter          : stats.jitter,
      netLevel        : netLevel
    };

    return audioStats;

  }

  getVideoStats(stats)
  {
    let packetLossRate;
    if (stats.packetsSent === 0) {
      packetLossRate = 0;
    }else {
      packetLossRate = stats.packetsLost/stats.packetsSent;
    }

    let netLevel = this.getNetlevel(packetLossRate);

    let videoStats = {
      bitrate         : stats.bitrate,
      packetLossRate  : packetLossRate,
      latency         : stats.latency,
      frameWidth      : stats.frameWidth,
      frameHeight     : stats.frameHeight,
      netLevel        : netLevel
    };

    return videoStats;

  }

  getNetlevel(packetLossRate)
  {
    let netLevel = 0;
    if (packetLossRate < 0.01) {
      netLevel = 5;
    }else if (packetLossRate < 0.03 && packetLossRate >= 0.01) {
      netLevel = 4;
    }else if (packetLossRate < 0.05 && packetLossRate >= 0.03) {
      netLevel = 3;
    }else if (packetLossRate < 0.1 && packetLossRate >= 0.05) {
      netLevel = 2;
    }else {
      netLevel = 1;
    }

    return netLevel;
  }

  //test
  log()
  {
    this._rtcRoom.log();
  }


  //todo 添加音频判断 添加没有视频时发起offer的sdp修改 课堂开始结束设计

}
