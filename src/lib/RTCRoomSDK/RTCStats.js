/**
 * Created by songtao on 2019/9/5.
 */

import Logger from './RTCLogger';
import TrackStats from './RTCTrackStats'

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('RTCStats');


export default class extends EventEmitter
{
  constructor(
    {
      peerId
    }
  ) {

    super();

    this._peerId = peerId;

    this._timer = null;

    this._RTCStatsResult = {};

    this._localCandidateId = null;
    this._remoteCandidateId = null;

    this.audioTrackStats = new TrackStats();
    this.videoTrackStats = new TrackStats();


    this.initRTCStatsResult();
  }

  initRTCStatsResult()
  {
    this._RTCStatsResult = {
      audio         : {
        bitrate         : 0,
        packetsSent     : 0,
        packetsReceived : 0,
        packetsLost     : 0,
        latency         : 0,
        jitter          : 0,
      },
      video         : {
        bitrate         : 0,
        packetsSent     : 0,
        packetsReceived : 0,
        packetsLost     : 0,
        latency         : 0,
        frameWidth      : 0,
        frameHeight     : 0,
      },
      connection: {
        local            : {
          candidateType   : '',
          ip              : '',
          port            : 0,
          networkType     : ''
        },
        remote           : {
          candidateType   : '',
          ip              : '',
          port            : 0,
        }
      }
    };
  }

  statsOutput()
  {
    return this._RTCStatsResult;
  }

  startReport(pc)
  {
    let that = this;

    if (that._timer) {
      return;
    }

    that._timer = setInterval(() => {

      if (!pc) {
        that.close();
        return;
      }

      pc.getStats(null).then(stats => {
        stats.forEach(report => {
          that.parseStatsReport(report);
        });
      });

      let data = {
        peerId: that._peerId,
        stats: that._RTCStatsResult
      };

      that.emit('user-stats',data);

    }, 10000);


  }

  close()
  {
    clearInterval(this._timer);
    this._timer = null;
  }

  parseStatsReport(report)
  {
    if (report.type === 'candidate-pair') {
      this.parseConnectionStatsReport(report);
    }else if (report.type === 'local-candidate') {
      this.parseLocalCandidateStatsReport(report)
    }else if (report.type === 'remote-candidate') {
      this.parseRemoteCandidateStatsReport(report)
    }else if (report.type === 'track') {
      if (report['remoteSource'] === false) {
        this.parseSendTrackStatsReport(report);
      }
      if (report['remoteSource'] === true) {
        this.parseRecvTrackStatsReport(report);
      }
    }else if (report.type === 'outbound-rtp') {
      if (report['kind'] === 'audio') {
        this.parseSendAudioRtpStatsReport(report);
      }
      if (report['kind'] === 'video') {
        this.parseSendVideoRtpStatsReport(report);
      }
    }else if (report.type === 'inbound-rtp') {
      if (report['kind'] === 'audio') {
        this.parseRecvAudioRtpStatsReport(report);
      }
      if (report['kind'] === 'video') {
        this.parseRecvVideoRtpStatsReport(report);
      }
    }else if (report.type === 'remote-inbound-rtp') {
      if (report['kind'] === 'audio') {
        this.parseAudioRttStatsReport(report);
      }
      if (report['kind'] === 'video') {
        this.parseVideoRttStatsReport(report);
      }
    }
  }


  parseConnectionStatsReport(report)
  {
    let that = this;

    if (report['nominated'] !== true) {
      return;
    }

    Object.keys(report).forEach(statName => {

      if (statName === 'localCandidateId') {
        that._localCandidateId = report[statName];
      } else if (statName === 'remoteCandidateId') {
        that._remoteCandidateId = report[statName];
      } else if (statName === 'totalRoundTripTime') {

      }

    })
  }

  parseLocalCandidateStatsReport(report)
  {
    let that = this;

    if (report['id'] !== that._localCandidateId) {
      return;
    }

    Object.keys(report).forEach(statName => {
      if (statName === 'candidateType') {
        that._RTCStatsResult.connection.local.candidateType = report[statName];
      } else if (statName === 'ip') {
        that._RTCStatsResult.connection.local.ip = report[statName];
      } else if (statName === 'port') {
        that._RTCStatsResult.connection.local.port = report[statName];
      } else if (statName === 'networkType') {
        that._RTCStatsResult.connection.local.networkType = report[statName];
      }
    })
  }

  parseRemoteCandidateStatsReport(report)
  {
    let that = this;

    if (report['id'] !== that._remoteCandidateId) {
      return;
    }

    Object.keys(report).forEach(statName => {
      if (statName === 'candidateType') {
        that._RTCStatsResult.connection.remote.candidateType = report[statName];
      } else if (statName === 'ip') {
        that._RTCStatsResult.connection.remote.ip = report[statName];
      } else if (statName === 'port') {
        that._RTCStatsResult.connection.remote.port = report[statName];
      }
    })
  }

  parseSendTrackStatsReport(report)
  {
    let that = this;

    if (report['kind'] === 'video') {
      Object.keys(report).forEach(statName => {
        if (statName === 'frameHeight') {
          that._RTCStatsResult.video.frameHeight = report[statName];
        } else if (statName === 'frameWidth') {
          that._RTCStatsResult.video.frameWidth = report[statName];
        }
      })
    }
  }


  parseRecvTrackStatsReport(report)
  {
    let that = this;

    if (report['kind'] === 'video') {
      Object.keys(report).forEach(statName => {
        if (statName === 'frameHeight') {
//          that._RTCStatsResult.video.recv.frameHeight = report[statName];
        } else if (statName === 'frameWidth') {
//          that._RTCStatsResult.video.recv.frameWidth = report[statName];
        }
      })
    }
  }

  parseSendAudioRtpStatsReport(report)
  {
    let that = this;

    Object.keys(report).forEach(statName => {
      if (statName === 'bytesSent') {
        that._RTCStatsResult.audio.bitrate = that.audioTrackStats.calculateBitrate(report[statName]);
      } else if (statName === 'packetsSent') {
        that._RTCStatsResult.audio.packetsSent = that.audioTrackStats.calculatePacketsSent(report[statName]);
      }
    })
  }

  parseSendVideoRtpStatsReport(report)
  {
    let that = this;

    Object.keys(report).forEach(statName => {
      if (statName === 'bytesSent') {
        that._RTCStatsResult.video.bitrate = that.videoTrackStats.calculateBitrate(report[statName]);
      }else if (statName === 'packetsSent') {
        that._RTCStatsResult.video.packetsSent = that.videoTrackStats.calculatePacketsSent(report[statName]);
      }
    })
  }

  parseRecvAudioRtpStatsReport(report)
  {
    let that = this;

    Object.keys(report).forEach(statName => {
      if (statName === 'bytesReceived') {
//        that._RTCStatsResult.audio.bytesReceived = report[statName];
      } else if (statName === 'packetsReceived') {
        that._RTCStatsResult.audio.packetsReceived = that.audioTrackStats.calculatePacketsReceived(report[statName]);
      } else if (statName === 'packetsLost') {
        that._RTCStatsResult.audio.packetsLost = that.audioTrackStats.calculatePacketsLost(report[statName]);
      }
    })
  }

  parseRecvVideoRtpStatsReport(report)
  {
    let that = this;

    Object.keys(report).forEach(statName => {
      if (statName === 'bytesReceived') {
//        that._RTCStatsResult.video.bytesReceived = report[statName];
      } else if (statName === 'packetsReceived') {
        that._RTCStatsResult.video.packetsReceived = that.videoTrackStats.calculatePacketsReceived(report[statName]);
      } else if (statName === 'packetsLost') {
        that._RTCStatsResult.video.packetsLost = that.videoTrackStats.calculatePacketsLost(report[statName]);
      }
    })
  }


  parseAudioRttStatsReport(report)
  {
    let that = this;

    Object.keys(report).forEach(statName => {
      if (statName === 'roundTripTime') {
        that._RTCStatsResult.audio.latency = parseInt(report[statName]*1000);
      } else if (statName === 'jitter') {
        that._RTCStatsResult.audio.jitter = parseInt(report[statName]*1000);
      }
    })
  }

  parseVideoRttStatsReport(report)
  {
    let that = this;

    Object.keys(report).forEach(statName => {
      if (statName === 'roundTripTime') {
        that._RTCStatsResult.video.latency = parseInt(report[statName]*1000);
      }
    })
  }

}
