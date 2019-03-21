'use strict';
const path = require('path');

module.exports = appInfo => {
  return {
    cluster: {
      listen: {
        port: 9997
      },
    },
    keys: appInfo.name + '_1541128646830_1117',
    logger: {
      consoleLevel: 'warn',
      level: 'warn',
      dir: path.join(appInfo.baseDir, 'logs')
    },
    logrotator: {
      maxDays: 3
    },
    mysql: {
      clients: {
        user: {
          database: 'lm_user',
        },
        rank: {
          database: 'lm_rank',
        },
        game: {
          database: 'lm_gobang',
        },
      },
      default: {
        host: '212.64.7.20',
        port: '3306',
        user: 'root',
        password: '926425',
        supportBigNumbers: true
      }
    },
    session: {
      key: 'lm',
      maxAge: 7 * 24 * 3600 * 1000,
    },
    middleware: ['checkLogin'],
    redis: {
      client: {
        host: '212.64.7.20',
        port: 6379,
        password: 'lim926425',
        db: 0,
      }
    },
    illegalWords: ['饭团', '匿名用户', '投票', '随机', '弱智AI', '机智AI'],
    io: {
      init: { },
      namespace: {
        '/': {
          connectionMiddleware: ['auth'],
          packetMiddleware: [],
        },
      }
    },
  };
};
