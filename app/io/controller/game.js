/**
 * color: 1 黑色 0 白色
 */
'use strict';

const MAX_ROOM_COUNT = 100;
const OFFLINE_DELAY_TIME = 3000;

module.exports = app => {
  class Controller extends app.Controller {
    onlineInfo() {
      this.ctx.socket.emit('onlineInfo', {onlineCount:  Object.keys(app.onlineUser).length});
    }

    async createRoom() {
      if (!this.ctx.session || !this.ctx.session.userId) return this.ctx.socket.emit('notice', {msg: '请先登录'});
      let params = this.ctx.args[0];
      let roomsCount = Object.keys(app.rooms).length;
      if (roomsCount >= MAX_ROOM_COUNT) {
        this.logger.warn(`创建失败，房间数量已达最大值: ${roomsCount}`);
        return this.ctx.socket.emit('createRoom', {err: '创建失败，房间数量已达最大值，请稍后再试'});
      }
      if (!params.roomName || params.roomName.length >= 20) return this.ctx.socket.emit('createRoom', {err: '创建失败，请输入正确的房间名'});
      if(app.onlineUser[this.ctx.session.userId].roomId)  return this.ctx.socket.emit('createRoom', {err: '创建失败，已在房间中'});
      app.roomIndex = await app.redis.get('roomIndex');
      app.roomIndex = app.roomIndex ? parseInt(app.roomIndex) + 1 : 1;
      await app.redis.set('roomIndex', app.roomIndex);
      let random = Math.round(Math.random());
      app.rooms[app.roomIndex] = {
        roomName: params.roomName,
        status: 0,  //0：刚创建的房间 1：人满未在游戏中的房间 2：游戏中的房间
        players: random ? {white: {username: this.ctx.session.username, userId: this.ctx.session.userId}} : {black: {username: this.ctx.session.username, status: 0, userId: this.ctx.session.userId}}
      };
      app.onlineUser[this.ctx.session.userId].roomId = app.roomIndex;
      app.onlineUser[this.ctx.session.userId].myColor = random;
      this.ctx.socket.emit('createRoom', {roomId: app.roomIndex, myColor: random});
      app.io.emit('roomsInfo', {rooms: app.rooms});
      this.logger.warn('创建成功，房间ID：' + app.roomIndex + ',房间名: ' + params.roomName, params);
    }

    roomsInfo() {
      if (!this.ctx.session || !this.ctx.session.userId) return this.ctx.socket.emit('notice', {msg: '请先登录'});
      this.ctx.socket.emit('roomsInfo', {rooms: app.rooms});
    }

    exitRoom() {
      if (!this.ctx.session || !this.ctx.session.userId) return this.ctx.socket.emit('notice', {msg: '请先登录'});
      if (app.onlineUser[this.ctx.session.userId].roomId) {
        let roomId = app.onlineUser[this.ctx.session.userId].roomId;
        if (app.rooms[roomId].players.black && app.rooms[roomId].players.black.userId === this.ctx.session.userId) {
          app.rooms[roomId].status = 0;
          delete app.rooms[roomId].pieces;
          delete app.rooms[roomId].players.black;
          delete(app.onlineUser[this.ctx.session.userId].roomId);
          delete(app.onlineUser[this.ctx.session.userId].myColor);
          if (app.rooms[roomId].players.white) {
            app.onlineUser[app.rooms[roomId].players.white.userId].socket.emit('notice', {msg: this.ctx.session.username + ' 离开了房间'});
            app.onlineUser[app.rooms[roomId].players.white.userId].socket.emit('exitRoom', {
              roomId,
              myColor: 1,
              myStatus: app.rooms[roomId].players.white.status
            });
          }
        }
        if (app.rooms[roomId].players.white && app.rooms[roomId].players.white.userId === this.ctx.session.userId) {
          app.rooms[roomId].status = 0;
          delete app.rooms[roomId].pieces;
          delete app.rooms[roomId].players.white;
          delete app.onlineUser[this.ctx.session.userId].roomId;
          delete app.onlineUser[this.ctx.session.userId].myColor;
          if (app.rooms[roomId].players.black) {
            app.onlineUser[app.rooms[roomId].players.black.userId].socket.emit('notice', {msg: this.ctx.session.username + ' 离开了房间'});
            app.onlineUser[app.rooms[roomId].players.black.userId].socket.emit('exitRoom', {
              roomId,
              myColor: 1,
              myStatus: app.rooms[roomId].players.black.status
            });
          }
        }
        if (!app.rooms[roomId].players.white && !app.rooms[roomId].players.black) delete app.rooms[roomId];
        this.ctx.socket.emit('exitRoom', {roomId});
        this.logger.warn(`${this.ctx.session.username} 退出房间`);
        app.io.emit('roomsInfo', {rooms: app.rooms});
      }
    }

    disconnect() {
      setTimeout(async () => {
        let user = app.onlineUser[this.ctx.session.userId];
        if (!user) {
          app.io.emit('onlineInfo', {onlineCount:  Object.keys(app.onlineUser).length});
          return;
        }
        let connectTime = user.connectTime;
        if (Date.now() - connectTime < OFFLINE_DELAY_TIME) return;
        this.exitRoom();
        delete app.onlineUser[this.ctx.session.userId];
        this.ctx.socket.broadcast.emit('notice', {msg:  `${this.ctx.session.username} 下线了`});
        app.io.emit('onlineInfo', {onlineCount:  Object.keys(app.onlineUser).length});
      }, OFFLINE_DELAY_TIME);
    }

    joinRoom() {
      if (!this.ctx.session || !this.ctx.session.userId) return this.ctx.socket.emit('notice', {msg: '请先登录'});
      let params = this.ctx.args[0];
      if (app.onlineUser[this.ctx.session.userId].roomId) return this.ctx.socket.emit('notice', {msg: '请先退出当前房间再重新加入'});
      if (!app.rooms[params.roomId]) return this.ctx.socket.emit('notice', {msg: '房间不存在'});
      if (app.rooms[params.roomId].black && app.rooms[params.roomId].white) return this.ctx.socket.emit('notice', {msg: '房间人数已满'});
      app.onlineUser[this.ctx.session.userId].roomId = params.roomId;
      app.rooms[params.roomId].status = 1;
      if (app.rooms[params.roomId].players.black) {
        app.onlineUser[this.ctx.session.userId].myColor = 1;
        app.rooms[params.roomId].players.white = {userId: this.ctx.session.userId, username: this.ctx.session.username, status: 0};
        this.ctx.socket.emit('joinRoom', {roomId: params.roomId, player: app.rooms[params.roomId].players.black, myColor: 1});
        app.onlineUser[app.rooms[params.roomId].players.black.userId].socket.emit('joinRoom', {roomId: params.roomId, player: app.rooms[params.roomId].players.white, myColor: 0, myStatus: app.rooms[params.roomId].players.black.status});
        app.onlineUser[app.rooms[params.roomId].players.black.userId].socket.emit('notice', {msg: this.ctx.session.username + ' 加入了房间'});
      } else {
        app.onlineUser[this.ctx.session.userId].myColor = 0;
        app.rooms[params.roomId].players.black = {userId: this.ctx.session.userId, username: this.ctx.session.username, status: 0};
        this.ctx.socket.emit('joinRoom', {roomId: params.roomId, player: app.rooms[params.roomId].players.white, myColor: 0});
        app.onlineUser[app.rooms[params.roomId].players.white.userId].socket.emit('joinRoom', {roomId: params.roomId, player: app.rooms[params.roomId].players.black, myColor: 1, myStatus: app.rooms[params.roomId].players.black.status});
        app.onlineUser[app.rooms[params.roomId].players.white.userId].socket.emit('notice', {msg: this.ctx.session.username + ' 加入了房间'});
      }
      app.io.emit('roomsInfo', {rooms: app.rooms});
      this.logger.warn(`${this.ctx.session.username} 加入了房间`);
    }

    ready() {
      if (!this.ctx.session || !this.ctx.session.userId) return this.ctx.socket.emit('notice', {msg: '请先登录'});
      if (!app.onlineUser[this.ctx.session.userId].roomId) return this.ctx.socket.emit('notice', {msg: '房间不存在'});
      let roomId = app.onlineUser[this.ctx.session.userId].roomId;
      if (app.onlineUser[this.ctx.session.userId].myColor) {
        app.rooms[roomId].players.white.status = 1;
        if (app.rooms[roomId].players.black) app.onlineUser[app.rooms[roomId].players.black.userId].socket.emit('ready', {username: this.ctx.session.username});
      } else {
        app.rooms[roomId].players.black.status = 1;
        if (app.rooms[roomId].players.white) app.onlineUser[app.rooms[roomId].players.white.userId].socket.emit('ready', {username: this.ctx.session.username});
      }
      this.ctx.socket.emit('ready', {username: this.ctx.session.username});
      if (app.rooms[roomId].players.white && app.rooms[roomId].players.white.status === 1 && app.rooms[roomId].players.black && app.rooms[roomId].players.black.status === 1) {
        app.rooms[roomId].status = 2;
        app.rooms[roomId].players.white.status = 0;//重置准备状态
        app.rooms[roomId].players.black.status = 0;
        app.rooms[roomId].order = Math.round(Math.random());//随机先手
        app.io.emit('roomsInfo', {rooms: app.rooms});
        this.ctx.socket.emit('beginGame', {order: app.rooms[roomId].order});
        app.onlineUser[app.rooms[roomId].players[app.onlineUser[this.ctx.session.userId].myColor ? 'black' : 'white']['userId']].socket.emit('beginGame', {order: app.rooms[roomId].order});
      }
    }

    drawPiece() {
      if (!this.ctx.session || !this.ctx.session.userId) return this.ctx.socket.emit('notice', {msg: '请先登录'});
      if (!app.onlineUser[this.ctx.session.userId].roomId) return this.ctx.socket.emit('notice', {msg: '房间不存在'});
      let roomId = app.onlineUser[this.ctx.session.userId].roomId;
      let params = this.ctx.args[0];
      let x = params.x, y = params.y;
      if (app.rooms[roomId].status !== 2) return this.ctx.socket.emit('notice', {msg: '请等待所有玩家准备后开始游戏'});
      if (!app.rooms[roomId].pieces) {//初始化棋盘
        app.rooms[roomId].pieces = {};
        for (let i = 0; i < 15; i++) {
          app.rooms[roomId].pieces[i] = {};
          for (let j = 0; j < 15; j++) {
            app.rooms[roomId].pieces[i][j] = {};
          }
        }
      }
      if (app.onlineUser[this.ctx.session.userId].myColor !== app.rooms[roomId].order) return this.ctx.socket.emit('drawPiece', {err: '还没轮到你'});
      let color = app.onlineUser[this.ctx.session.userId].myColor;
      if (x >= 0 && x <= 14 && y >= 0 && y <= 14) {
        if (app.rooms[roomId].pieces[x][y]['color'] === undefined) {
          app.rooms[roomId].pieces[x][y]['color'] = color;
          app.rooms[roomId].order = color ? 0 : 1;
          this.ctx.socket.emit('drawPiece', {
            x: x,
            y: y,
            myColor: color,
            order: app.rooms[roomId].order
          });
          app.onlineUser[app.rooms[roomId].players[app.onlineUser[this.ctx.session.userId].myColor ? 'black' : 'white']['userId']].socket.emit('drawPiece', {
            x: x,
            y: y,
            myColor: color,
            order: app.rooms[roomId].order
          });
          if (this.checkWin(x, y, color, app.rooms[roomId].pieces)) {
            this.ctx.service.game.addGameLog({
              roomId: roomId,
              black: app.rooms[roomId].players.black.userId,
              white: app.rooms[roomId].players.white.userId,
              win: this.ctx.session.userId,
              pieces: JSON.stringify(app.rooms[roomId].pieces)
            });
            app.rooms[roomId].status = 1;
            delete app.rooms[roomId].pieces;
            this.ctx.socket.emit('win', {color: color});
            app.onlineUser[app.rooms[roomId].players[app.onlineUser[this.ctx.session.userId].myColor ? 'black' : 'white']['userId']].socket.emit('win', {color: color});
            app.io.emit('roomsInfo', {rooms: app.rooms});
          }
        } else {
          return this.ctx.socket.emit('drawPiece', {err: '兄弟，这里已经有子了！'});
        }
      }
    }

    checkWin (x, y, color, pieces) {
      var tempX = x, tempY = y;
      let horizontal = 0, vertical = 0, leftSkew = 0, rightSkew = 0;
      /* ----------------------水平计算---------------------- */
      while (horizontal < 4) {
        tempX--;
        if (tempX >= 0 && pieces[tempX][y]['color'] === color) {
          horizontal++;
        } else {
          break;
        }
      }
      if (horizontal >= 4) {
        return true;
      }
      tempX = x;
      while (horizontal < 4) {
        tempX++;
        if (tempX < 15 && pieces[tempX][y]['color'] === color) {
          horizontal++;
        } else {
          break;
        }
      }
      if (horizontal >= 4) {
        return true;
      }
      /* ----------------------|垂直计算|---------------------- */
      while (vertical < 4) {
        tempY--;
        if (tempY >= 0 && pieces[x][tempY]['color'] === color) {
          vertical++;
        } else {
          break;
        }
      }
      if (vertical >= 4) {
        return true;
      }
      tempY = y;
      while (vertical < 4) {
        tempY++;
        if (tempY < 15 && pieces[x][tempY]['color'] === color) {
          vertical++;
        } else {
          break;
        }
      }
      if (vertical >= 4) {
        return true;
      }
      /* ----------------------＼左斜计算＼---------------------- */
      tempX = x;
      tempY = y;
      while (leftSkew < 4) {
        tempX--;
        tempY--;
        if (tempX >= 0 && tempY >= 0 && pieces[tempX][tempY]['color'] === color) {
          leftSkew++;
        } else {
          break;
        }
      }
      if (leftSkew >= 4) {
        return true;
      }
      tempX = x;
      tempY = y;
      while (leftSkew < 4) {
        tempX++;
        tempY++;
        if (tempX < 15 && tempY < 15 && pieces[tempX][tempY]['color'] === color) {
          leftSkew++;
        } else {
          break;
        }
      }
      if (leftSkew >= 4) {
        return true;
      }
      /* ----------------------／右斜计算／---------------------- */
      tempX = x;
      tempY = y;
      while (rightSkew < 4) {
        tempX++;
        tempY--;
        if (tempX < 15 && tempY >= 0 && pieces[tempX][tempY]['color'] === color) {
          rightSkew++;
        } else {
          break;
        }
      }
      if (rightSkew >= 4) {
        return true;
      }
      tempX = x;
      tempY = y;
      while (rightSkew < 4) {
        tempX--;
        tempY++;
        if (tempX >= 0 && tempY < 15 && pieces[tempX][tempY]['color'] === color) {
          rightSkew++;
        } else {
          break;
        }
      }
      return rightSkew >= 4;
    }
  }
  return Controller;
};
