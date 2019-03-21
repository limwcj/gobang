'use strict';

const Controller = require('egg').Controller;

class RankController extends Controller {
  async getRank() {
    if (!this.ctx.request.body.rankName || (this.ctx.request.body.pageSize && isNaN(parseInt(this.ctx.request.body.pageSize)))) return this.ctx.body = {code: -1, message: '参数错误！'};
    try {
      let result = await this.ctx.service.rank.getRank(this.ctx.request.body.rankName, parseInt(this.ctx.request.body.pageSize));
      this.ctx.body = {code: 0, message: 'success', result: result};
    } catch (e) {
      this.logger.error(e.stack);
      this.ctx.body = {code: -1, message: '查询排行榜失败'};
    }
  }
}

module.exports = RankController;
