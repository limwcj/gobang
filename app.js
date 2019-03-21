module.exports = app => {
  app.beforeStart(async () => {
    app.onlineUser = {};
    app.rooms = {};
    app.roomIndex = 0;
  });
};
