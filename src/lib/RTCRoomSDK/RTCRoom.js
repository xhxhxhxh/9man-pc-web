/**
 * Created by songtao on 2019/7/22.
 */

import adapter from 'webrtc-adapter';
import io from 'socket.io-client';
import Logger from './RTCLogger';
import {RTC_USER_ROLE,RTC_ERROR_MSG} from './RTCDefine';
import SoundMeter from './soundmeter'
import RTCStats from './RTCStats'
import RTCRoomManager from './RTCRoomManager'

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('RTCRoom');

const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }]};

const mediaConstraints = {
  "video": {
    width: 320,
    height: 240,
    frameRate: { ideal: 10, max: 15 }
  },
  "audio": true
};

const iceOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

let PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
let URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
let getUserMediaSupport = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
let nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
let nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
let moz = !!navigator.mozGetUserMedia;
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();

let localMediaStream = null;

let peerIds = [];
let peerConnections = new Map();
let channels = new Map();
let statsManagers = new Map();

export default class extends EventEmitter
{

  static init()
  {
    logger.debug('init');
  }

  constructor(
    {
      host,
      port,
      roomId,
      peerId,
    }
  )
  {
    super();

    this._socketUrl = `wss://${host}:${port}/?roomId=${roomId}&peerId=${peerId}`;

    this._socket = null;

    this._roomId = roomId;

    this._peerId = peerId;

    this._deviceStatus = 0;

    this._volume_timer = null;
  }

  join()
  {
    let that = this;

    this._socket = io(this._socketUrl);

    this._socket.once('connect', (data) => {
      logger.debug('服务器连接成功');
      this.emit('rtc-socket-connect',{});
    });

    this._socket.on('connect_failed', (data) => {
      let obj = {
        code: 401,
        msg: RTC_ERROR_MSG.ConnectSocket_Error
      };
      this.emit('rtc-error-notice',obj);
    });

    this._socket.on('disconnect', (data) => {
      let obj = {
        code: 410,
        msg: RTC_ERROR_MSG.ConnectSocket_Disconnect
      };
      this.emit('rtc-error-notice',obj);
    });

    this._socket.on('reconnect', (data) => {
      let obj = {
        code: 411,
        msg: RTC_ERROR_MSG.ConnectSocket_Reconnect
      };
      this.emit('rtc-error-notice',obj);
    });

    this._socket.on('reconnecting', (data) => {
      logger.debug('正在重新连接...');
      if (data > 5) {
//        socket.disconnect(true);
//        socket.connect();
      }
    });

    this._socket.on('_ack', (data,ack) => {
      ack('我是ack');
    });

    this._socket.on('ping', (data) => {
      logger.debug('ping');
    });

    this._socket.on('pong', (data) => {
      logger.debug('pong');
    });

    this._socket.on('message', (data) => {
      let message;
      if (typeof data === 'string') {
        message = JSON.parse(data);
      }else if (typeof data === 'object') {
        message = data;
      }
      this.emit('rtc-socket-message',message);
    });

    this._socket.on('signaling', async (message) => {

      let signaling;

      if (typeof message === 'string') {
        signaling = JSON.parse(message);
      }else if (typeof message === 'object') {
        signaling = message;
      }

      logger.debug('signaling [method:%s]',signaling.method);

      let data = signaling.data;

      switch (signaling.method)
      {
        case 'peers' :
        {
          if (data.iceServers) {
            configuration.iceServers = data.iceServers;
          }

          let obj = {
            peerId: this._peerId,
            properties: data.properties
          };

          this.emit('rtc-user-joined',obj);

          await this.initLocalMediaStream();

          peerIds = data.peerIds;

//          peerIds.forEach((peerId) => that._createPeerConnection(peerId,true));
          for (let i in peerIds) {
            await that._createPeerConnection(peerIds[i],true);
          }

//          peerConnections.forEach((item, key, mapObj) => {
//            that._addTrack(item);
//          });
          let ids = [...peerConnections.keys()];
          for (let i in ids) {
            let peerId = ids[i];
            let pc = peerConnections.get(peerId);
            await that._addTrack(pc);

            let property = data.properties[peerId];
            let device = property['device'] ? property['device'] : 0;
            if (device !== 0 || this._deviceStatus === 0) {
              await that._createOffer(pc, peerId);
            }

          }

          break;
        }
        case 'new_peer' :
        {
          let peerId = data.peerId;

          let properties = {};
          properties[peerId] = data.property;

          let obj = {
            peerId: peerId,
            properties: properties
          };

          this.emit('rtc-user-joined',obj);

          if(peerIds.indexOf(peerId) === -1) {
            peerIds.push(peerId);
          }

          that._createPeerConnection(peerId,false);

          let pc = peerConnections.get(peerId);

          that._addTrack(pc);

          let device = data.property['device'] ? data.property['device'] : 0;
          if (device !== 0 && this._deviceStatus === 0) {
            await that._createOffer(pc, peerId);
          }

          break;
        }
        case 'desc' :
        {
          let desc = data.desc;

          let peerId = data.from;

          let pc = peerConnections.get(peerId);

          if (desc.type === 'offer') {

            await that._createAnswer(pc, peerId, desc);

          } else if (desc.type === 'answer') {

            await pc.setRemoteDescription(new nativeRTCSessionDescription(desc));

          } else {

            logger.error('Unsupported SDP type. Your code may differ here.');

          }

          break;
        }
        case 'candidate' :
        {

          let candidate = data.candidate;
          let rtcIceCandidate = new nativeRTCIceCandidate({
            candidate: candidate.sdp,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
          });

          let pc = peerConnections.get(data.from);

          await pc.addIceCandidate(rtcIceCandidate);

          break;
        }
        case 'remove_peer' :
        {
          let peerId = data.peerId;

          this._closeConnection(peerId);

          break;
        }

        default :
        {

        }

      }

    });

  }

  async joinRoom(userProperty)
  {
    logger.debug('_joinRoom()');

    this._deviceStatus = userProperty ? userProperty['device'] : 0;

    let data = userProperty ? userProperty : {};

    let signaling = this._signalingFactory('join',data);

    this.socketEmit('signaling',signaling);

  }

  async _createPeerConnection(peerId,initiator)
  {
    logger.debug('_createPeerConnection() [peerId:%s]', peerId);

    let that = this;

    let pc = new RTCPeerConnection(configuration);

    peerConnections.set(peerId,pc);

    // send any ice candidates to the other peer
    pc.onicecandidate = ({candidate}) => {

      if (candidate) {
        let data = {
          "from": that._peerId,
          "to": peerId,
          "room": that._roomId,
          "candidate": {
            "sdpMid": candidate.sdpMid,
            "sdpMLineIndex": candidate.sdpMLineIndex,
            "sdp": candidate.candidate
          }
        };

        let signaling = this._signalingFactory('candidate',data);

        this.socketEmit('signaling',signaling);
      }

    };

    pc.oniceconnectionstatechange = (evt) => {

      if (pc.iceConnectionState === "connected") {
        this.emit('rtc-peer-connected',{ peerId: peerId });

//        this.gatherStats(pc, peerId);

      }else if (pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "closed") {
        // Handle the failure

//        this.clearStats(peerId);
      }else if (pc.iceConnectionState === "completed") {

      }
    };

// let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = async () => {

//      if (!initiator) {
//        return;
//      }

//      try {
//
//        await pc.setLocalDescription(await pc.createOffer([iceOptions]));
//        // send the offer to the other peer
//
//
//        let data = {
//          "from": that._peerId,
//          "to": peerId,
//          "room": that._roomId,
//          "desc": pc.localDescription
//        };
//
//        let signaling = this._signalingFactory('desc',data);
//
//        this.socketEmit('signaling',signaling);
//
//      } catch (err) {
//        console.error(err);
//      }
    };

    if (initiator) {
      // create data channel and setup

      let params = {
        ordered: true,
        id: 25,
        negotiated: false,
//				maxPacketLifeTime: -1,
//				maxRetransmits: 0,
        protocol: ''
      };

      let channel = pc.createDataChannel('channel',params);

      that._setupChannel(peerId,channel);
    } else {
      // setup chat on incoming data channel
      pc.ondatachannel = (event) => {
        that._setupChannel(peerId,event.channel);
      };
    }

// once media for a remote track arrives, show it in the remote video element
    pc.ontrack = (event) => {
      // don't set srcObject again if it is already set.
//      if (remoteView.srcObject) return;
//      remoteView.srcObject = event.streams[0];
      logger.debug('ontrack()');

      let obj = {
        peerId: peerId,
        stream: event.streams[0]
      };
      this.emit('rtc-media-receive',obj);
    };

  }

  _setupChannel(peerId,channel) {
    channel.onopen = () => {
      logger.debug('channel.onopen()');
    };
    channel.onclose = () => {
      logger.debug('channel.onclose()');
    };
    channel.onerror = (error) => {
      logger.debug('channel.onerror() [%s]',error);
    };
    channel.onmessage = (event) =>  {
      this._receiveMessage(event.data);
    };

    channels.set(peerId,channel);
  }

  _getChannel(peerId) {
    return channels.get(peerId);
  }

  async _createOffer(pc, peerId) {
    let that = this;

    try {

      let sdp = await pc.createOffer([iceOptions]);

      let sdp_new = that._rewriteSdp(sdp,peerId);

      await pc.setLocalDescription(sdp_new);
      // send the offer to the other peer

//      console.log(pc.localDescription);

      let data = {
        "from": that._peerId,
        "to": peerId,
        "room": that._roomId,
        "desc": pc.localDescription
      };

      let signaling = that._signalingFactory('desc',data);

      that.socketEmit('signaling',signaling);

    } catch (err) {
      console.error(err);
    }
  }


  async _createAnswer(pc, peerId, desc) {
    let that = this;

    try {

      await pc.setRemoteDescription(new nativeRTCSessionDescription(desc));

      await pc.setLocalDescription(await pc.createAnswer());

//      console.log(pc.localDescription);

      let data = {
        "from": that._peerId,
        "to": peerId,
        "room": that._roomId,
        "desc": pc.localDescription
      };

      let signaling = that._signalingFactory('desc',data);

      that.socketEmit('signaling',signaling);

    }catch (err) {
      console.error(err);
    }
  }

  _rewriteSdp(session_desc,peerId) {
    let sdp = session_desc.sdp;
    let sdp_new;
    let roomManager = RTCRoomManager.getInstance();
    let localUser = roomManager.getRoomUser(this._peerId);
    let user = roomManager.getRoomUser(peerId);
    let a = localUser.property['role'] == RTC_USER_ROLE.Invisible;
    let b = user.property['role'] == RTC_USER_ROLE.Invisible;
    if (a && b) {
      sdp_new = sdp.replace(/sendrecv/g, "inactive");
    }else if (a && !b) {
      sdp_new = sdp.replace(/sendrecv/g, "recvonly");
    }else if (!a && b) {
      sdp_new = sdp.replace(/sendrecv/g, "sendonly");
    }else {
      sdp_new = sdp;
    }
    session_desc.sdp = sdp_new;
    return session_desc;
  };

  sendMessage(message,peerId) {
    let data = JSON.stringify(message);
    if (peerId) {
      let channel = this._getChannel(peerId);
      if (channel === undefined) {
        let obj = {
          code: 405,
          msg: RTC_ERROR_MSG.Undefined_Error
        };
        this.emit('rtc-error-notice',obj);
        return;
      }
      if (channel.readyState.toLowerCase() === 'open') {
        channel.send(data);
      }
    }else {
      channels.forEach((item, key, mapObj) => {
        if (item.readyState.toLowerCase() === 'open') {
          item.send(data);
        }
      });
    }
  }

  _receiveMessage(message) {
    if (typeof(message) === 'string') {
      let data = JSON.parse(message);
      let obj = {
        message: data
      };
      this.emit('rtc-message-receive',obj);
    }
  }

  async _addTrack(pc) {

    if (this._deviceStatus === 3) {
      return;
    }

    if (!localMediaStream) {
      await this.initLocalMediaStream();
    }

    try {
      // get a local stream, show it in a self-view and add it to be sent

      localMediaStream.getTracks().forEach((track) => {
        pc.addTrack(track, localMediaStream);
      });

    } catch (err) {
      console.error(err);
    }
  }

  async initLocalMediaStream() {

    if (this._deviceStatus === 3) {
      return;
    }

    if (!localMediaStream) {

      let constraints = mediaConstraints;

      if (this._deviceStatus === 1) {
        constraints = {
          "video": false,
          "audio": true
        }
      }else if (this._deviceStatus === 2) {
        constraints = {
          "video": true,
          "audio": false
        }
      }

      localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      let obj = {
        peerId: this._peerId,
        stream: localMediaStream
      };
      this.emit('rtc-media-receive',obj);

      if (this._deviceStatus === 0 || this._deviceStatus === 1) {
//        this.voiceActivityDetection();
      }

    }
  }

  voiceActivityDetection()
  {
    let that = this;

    if (typeof audioContext.resume === 'function' && audioContext.state !== 'running') {
      audioContext.resume().then(function() {
        logger.debug('resumed successfully');
      });
    }

    const soundMeter = new SoundMeter(audioContext);
    soundMeter.connectToSource(localMediaStream, function(e) {
      if (e) {
        logger.error(e);
        return;
      }
      that._volume_timer = setInterval(() => {
        let volume = soundMeter.instant.toFixed(2);
        if (volume > 0 && localMediaStream.getAudioTracks()[0].enabled) {
          that.emit('rtc-audio-volume',{peerId:that._peerId,volume:volume});
        }

//           soundMeter.slow.toFixed(2);
//           soundMeter.clip;
      }, 2000);
    });
  }

  //音视频控制
  async openVideo(peerId)
  {
    let peer = peerConnections.get(peerId);
    if (peer) {
      let Rtpsender = this.getRTCRtpSenderVideo(peer);
      if (localMediaStream.getVideoTracks().length && Rtpsender) {
        let sender = localMediaStream.getVideoTracks()[0];
        await Rtpsender.replaceTrack(sender);
      }else {
        logger.error('RTCMediaStreamTrack not exist!');
      }
    }
  }

  async closeVideo(peerId)
  {
    let peer = peerConnections.get(peerId);
    if (peer) {
      let sender = this.getRTCRtpSenderVideo(peer);
      if (sender) {
        await sender.replaceTrack(null);
      }else {
        logger.error('RTCRtpSender not exist!');
      }
    }
  }

  getRTCRtpSenderVideo(peer)
  {
    let list = peer.getSenders();
    for (let i = 0; i < list.length; i++) {
      let sender = list[i];
      let track = sender.track;
      if (!track || track.kind === 'video') {
        return sender;
      }
    }
    return null;
  }

  openAudio()
  {
    localMediaStream.getAudioTracks()[0].enabled = true;
  }

  closeAudio()
  {
    localMediaStream.getAudioTracks()[0].enabled = false;
  }

  close() {

    let that = this;

    clearInterval(that._volume_timer);

    peerConnections.forEach((item, key, mapObj) => {
      that.clearStats(key);
      item.close();
    });

    peerIds = [];
    peerConnections = new Map();
    channels = new Map();
    statsManagers = new Map();

    let data = {
      "peerId": this._peerId,
    };

    let signaling = this._signalingFactory('remove_peer',data);

    this._socket.emit('signaling', JSON.stringify(signaling));
    this.disconnect();
  }

  _closeConnection(peerId) {

//    this.clearStats(peerId);

    let pc = peerConnections.get(peerId);
    if (pc) {
      pc.close();
    }

    let index = peerIds.indexOf(peerId);

    if (index > -1) {
      peerIds.splice(index, 1);
      peerConnections.delete(peerId);
      channels.delete(peerId);
    }

    let obj = {
      peerId: peerId
    };
    this.emit('rtc-user-leaved',obj);

  }

  disconnect()
  {
    if (this._socket) {
      this._socket.disconnect(true);
      this._socket = null;
    }
  }

  _signalingFactory(method, data)
  {
    const signaling =
            {
              signaling    : true,
              method       : method,
              data         : data || {}
            };
    return signaling;
  }

  //socket emit
  socketEmit(method, data)
  {
    if (this._socket) {
      this._socket.emit(method, JSON.stringify(data));
    }
  }

  gatherStats(pc, peerId)
  {
    let that = this;

    let stats = statsManagers.get(peerId);
    if (!stats || stats === 'undefined') {
      stats = new RTCStats({peerId});

      stats.on('user-stats',(data) => {
        that.emit('rtc-user-stats',data);
      });

      statsManagers.set(peerId, stats);
    }

    stats.startReport(pc);

  }

  clearStats(peerId)
  {

    let stats = statsManagers.get(peerId);

    if (stats) {

      stats.close();

      statsManagers.delete(peerId);

    }
  }

  //test
  log()
  {
//    let that = this;
//    peerConnections.forEach((item, key, mapObj) => {
//      console.log(item.getTransceivers());
//      console.log(item.getReceivers());
//      let rtcRtpReceiver = item.getReceivers()[0];
//      console.log(rtcRtpReceiver);
//      let rtcRtpContributingSources = rtcRtpReceiver.getSynchronizationSources();
//      console.log(rtcRtpContributingSources);
//    });

  }

}
