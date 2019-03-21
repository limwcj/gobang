'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  constructor(ctx) {
    super(ctx);
    this.userDb = this.app.mysql.get('user');
  }

  async checkUsername(username) {
    return await this.userDb.get('t_user', { username: username});
  }

  async addUser(username, password) {
    return await this.userDb.insert('t_user', { username: username, password: password });
  }

  async checkUser(username, password) {
    return await this.userDb.get('t_user', { username: username, password: password });
  }
}

module.exports = UserService;
