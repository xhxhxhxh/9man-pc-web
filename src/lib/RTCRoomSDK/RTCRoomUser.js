/**
 * Created by songtao on 2019/7/22.
 */

import Logger from './RTCLogger';

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('RTCRoomUser');

export default class extends EventEmitter
{
  constructor(
    {
      peerId,
      property
    }
  ) {

    super();

    this._peerId = peerId;

    this._property = property;

  }

  init(peerId,property)
  {
    this._peerId = peerId;
    this._property = property;
  }

  changeProperty(property)
  {
    let that = this;
    Object.keys(property).forEach(function(key){
      let value = property[key];
      if (that._property.hasOwnProperty(key)) {
        that._property[key] = value;
      }
    });
  }

  get peerId()
  {
    return this._peerId;
  }

  get property()
  {
    return this._property;
  }

  get name()
  {
    return this._property['name'] ? this._property['name'] : '';
  }

  get role()
  {
    return this._property['role'] ? this._property['role'] : 0;
  }
}


