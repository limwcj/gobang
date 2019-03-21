'use strict';

const Service = require('egg').Service;

class GameService extends Service {
  constructor(ctx) {
    super(ctx);
    this.gameDb = this.app.mysql.get('game');
  }

  async addGameLog(params) {
    return await this.gameDb.insert('lm_gobang_log', params);
  }
}

module.exports = GameService;
