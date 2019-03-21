'use strict';

const Service = require('egg').Service;

class RankService extends Service {
  constructor(ctx) {
    super(ctx);
    this.rankDb = this.app.mysql.get('rank');
  }

  async addRank(params) {
    return await this.rankDb.insert('t_rank', params);
  }

  async getRank(rankName, pageSize) {
    pageSize = pageSize || 10;
    let sql = `SELECT a.*,b.username FROM t_rank a LEFT JOIN lm_user.t_user b ON a.userId = b.userId WHERE rankName = ? ORDER BY rankNumber DESC,rankString ASC,createDate asc limit ?`;
    return await this.rankDb.query(sql, [rankName, pageSize]);
  }
}

module.exports = RankService;
