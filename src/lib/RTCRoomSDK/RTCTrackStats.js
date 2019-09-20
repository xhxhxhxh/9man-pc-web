/**
 * Created by songtao on 2019/9/9.
 */

import Logger from './RTCLogger';

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('RTCTrackStats');


export default class
{
  constructor()
  {

    this.prevTime = 0;
    this.prevPacketsSent = 0;
    this.prevPacketsReceived = 0;
    this.prevBytes = null;
    this.prevPacketsLost = null;
    this.prevLatency = null;

  }


  calculatePacketsSent(currentPacketsSent)
  {
    let packetsSent = currentPacketsSent - this.prevPacketsSent;
    this.prevPacketsSent = currentPacketsSent;
    return packetsSent;
  }

  calculatePacketsReceived(currentPacketsReceived)
  {
    let packetsReceived = currentPacketsReceived - this.prevPacketsReceived;
    this.prevPacketsReceived = currentPacketsReceived;
    return packetsReceived;
  }

  calculateBitrate(bytes)
  {
    if (!this.prevBytes) {
      this.prevBytes = bytes;
    }

    let bitrate = 0;
    let currentTime = new Date().getTime()/1000;

    if (this.prevTime && (bytes > this.prevBytes)) {
      bitrate = (bytes - this.prevBytes) / (currentTime - this.prevTime);
    }
    this.prevBytes = bytes;
    this.prevTime = currentTime;

    return parseInt(bitrate/1000);
  }

  calculatePacketsLost(totalPacketsLost)
  {
    if (!this.prevPacketsLost) {
      this.prevPacketsLost = totalPacketsLost;
    }

    let packetsLost = totalPacketsLost - this.prevPacketsLost;
    this.prevPacketsLost = totalPacketsLost;

    packetsLost = parseInt(packetsLost);

    if (packetsLost < 0) {
      packetsLost = 0;
    }

    return packetsLost;
  }

  calculateLatency(totalRoundTripTime)
  {
    if (!this.prevLatency) {
      this.prevLatency = totalRoundTripTime;
    }

    let latency = totalRoundTripTime - this.prevLatency;
    this.prevLatency = totalRoundTripTime;

    latency = parseInt(latency*1000);

    if (latency < 0) {
      latency = 0;
    }

    return latency;
  }

}
