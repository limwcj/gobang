'use strict';

const path = require('path');
const CryptoJS = require('crypto-js');

module.exports = {
  async onlineUsers(room) {
    return await this.app.redis.keys(`${this.app.config._io.PREFIX_ONLINE}:${room}:*`);
  },
  md5,
  sha1,
};

function md5(text) {
  return CryptoJS.MD5(text.toString()).toString();
}

function sha1(text) {
  return CryptoJS.SHA1(text.toString()).toString();
}