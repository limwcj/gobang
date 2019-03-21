'use strict';

async function connect(ctx, app, next) {
  if (ctx.session && ctx.session.userId) {
    if (!app.onlineUser[ctx.session.userId]) {
      ctx.socket.broadcast.emit('notice', {msg: `${ctx.session.username} 上线了`});
      app.onlineUser[ctx.session.userId] = {
        username: ctx.session.username,
        connectTime: Date.now(),
        socket: ctx.socket
      };
    } else {
      app.onlineUser[ctx.session.userId].connectTime = Date.now();
      app.onlineUser[ctx.session.userId].socket = ctx.socket;
    }
  }
  app.io.emit('onlineInfo', {onlineCount:  Object.keys(app.onlineUser).length});
}

async function disconnect(ctx, app) {}

module.exports = app => {
  return async (ctx, next) => {
    await connect(ctx, app, next);
    await next();
    await disconnect(ctx, app);
  };
};
