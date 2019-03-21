'use strict';

module.exports = app => {
  app.router.redirect('/', '/public/index.html', 302);

  app.router.post('/user/checkUsername', app.controller.user.checkUsername);
  app.router.post('/user/register', app.controller.user.register);
  app.router.post('/user/login', app.controller.user.login);
  app.router.post('/user/logout', app.controller.user.logout);
  app.router.post('/user/getUser', app.controller.user.getUser);

  app.router.post('/rank/getRank', app.controller.rank.getRank);

  app.io.route('onlineInfo', app.io.controller.game.onlineInfo);
  app.io.route('createRoom', app.io.controller.game.createRoom);
  app.io.route('roomsInfo', app.io.controller.game.roomsInfo);
  app.io.route('exitRoom', app.io.controller.game.exitRoom);
  app.io.route('disconnect', app.io.controller.game.disconnect);
  app.io.route('joinRoom', app.io.controller.game.joinRoom);
  app.io.route('ready', app.io.controller.game.ready);
  app.io.route('drawPiece', app.io.controller.game.drawPiece);
};
