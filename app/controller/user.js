'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async checkUsername() {
    let username = this.ctx.request.body.username;
    if (!username) return this.ctx.body = {code: -1, message: '用户名不能为空！'};
    let result = await this.ctx.service.user.checkUsername(username);
    if (result)  return this.ctx.body = {code: -1, message: '用户名已存在！'};
    this.ctx.body = {code: 0, message: 'success！'};
  }

  async register() {
    let username = this.ctx.request.body.username;
    let password = this.ctx.request.body.password;
    if (!username) return this.ctx.body = {code: -1, message: '用户名不能为空！'};
    if (!password) return this.ctx.body = {code: -1, message: '密码不能为空！'};
    if (password.length < 6) return this.ctx.body = {code: -1, message: '密码长度不正确！大于等于6'};
    if (this.config.illegalWords.indexOf(username) != -1) return this.ctx.body = {code: -1, message: '敏感词汇'};
    let result = await this.ctx.service.user.checkUsername(username);
    if (result) return this.ctx.body = {code: -1, message: '用户名已存在！'};
    let result1 = await this.ctx.service.user.addUser(username, this.ctx.helper.md5(password));
    this.ctx.session = {username: username, userId: result1.insertId};
    this.ctx.rotateCsrfSecret();
    this.ctx.body = {code: 0, message: 'success！', result: this.ctx.session};
  }

  async login() {
    let username = this.ctx.request.body.username;
    let password = this.ctx.request.body.password;
    if (!username) return this.ctx.body = {code: -1, message: '用户名不能为空！'};
    if (!password) return this.ctx.body = {code: -1, message: '密码不能为空！'};
    let result = await this.ctx.service.user.checkUser(username, this.ctx.helper.md5(password));
    if (result) {
      this.ctx.session = {username: username, userId: result.userId};
      this.ctx.rotateCsrfSecret();
      this.ctx.body = {code: 0, message: 'success！', result: this.ctx.session};
    } else {
      this.ctx.body = {code: -1, message: '用户名或密码错误！'};
    }
  }

  async logout() {
    this.ctx.session = null;
    return this.ctx.body = {code: 0, message: '退出成功！'};
  }

  async getUser() {
    this.ctx.body = {code: 0, message: 'success！', result: Object.assign(this.ctx.session, this.app.onlineUser[this.ctx.session.userId] ? {
      roomId: this.app.onlineUser[this.ctx.session.userId].roomId,
      myColor: this.app.onlineUser[this.ctx.session.userId].myColor
    } : {})};
  }
}

module.exports = UserController;
