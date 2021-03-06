/**
 * Created by songtao on 2019/7/26.
 */

import {RTC_DEVICE_ERROR} from './RTCDefine';
import Logger from './RTCLogger';

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('RTCDevice');

export default class extends EventEmitter
{
  constructor()
  {

    super();

    this.deviceState = 0;

    this._deviceList = [];

  }

  async checkDevice()
  {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      logger.debug('不支持 getUserMedia()');
      return;
    }

    await this.checkDeviceStatus();

    let that = this;

    let constraints = {video: true, audio: true};

    await navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {

      }).catch(function (err) {

        if(err.name === "NotFoundError"){
          that._emitError(RTC_DEVICE_ERROR.NotFoundError);
        }else if(err.name === "NotReadableError"){
          that._emitError(RTC_DEVICE_ERROR.NotReadableError);
        }else if(err.name === "OverconstrainedError"){
          that._emitError(RTC_DEVICE_ERROR.OverconstrainedError);
        }else if(err.name === "NotAllowedError"){
          that._emitError(RTC_DEVICE_ERROR.NotAllowedError);
        }else if(err.name === "TypeError"){
          that._emitError(RTC_DEVICE_ERROR.TypeError);
        }else if(err.name === "AbortError"){
          that._emitError(RTC_DEVICE_ERROR.AbortError);
        }else {
          // other errors
        }
    });

    navigator.mediaDevices.ondevicechange = function(event) {
//      updateDeviceList();
      console.log(event);
    }

  }

  async checkDeviceStatus()
  {
    let audioStatus = true;
    let videoStatus = true;
    await navigator.mediaDevices.getUserMedia({video: false, audio: true})
      .then(function (stream) {

      }).catch(function (err) {
        audioStatus = false;
      });

    await navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(function (stream) {

      }).catch(function (err) {
        videoStatus = false;
      });

    if (audioStatus && videoStatus) {
      this.deviceState = 0;
    }else if (audioStatus && !videoStatus) {
      this.deviceState = 1;
    }else if (!audioStatus && videoStatus) {
      this.deviceState = 2;
    }else {
      this.deviceState = 3;
    }
  }

  _emitError(msg)
  {
    this.emit('device_error',msg);
  }

  gotDevice()
  {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      logger.debug('不支持 enumerateDevices()');
      return;
    }

    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        devices.forEach(function(device) {
//          console.log(device.kind + ": " + device.label +
//            " id = " + device.deviceId);
//          console.log(device);
        });
      })
      .catch(function(err) {
        console.log(err.name + ": " + err.message);
      });
  }

}
