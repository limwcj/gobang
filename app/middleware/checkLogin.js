module.exports = () => {
  return async function checkLogin(ctx, next) {
    if ((['/user/login', '/user/register', '/user/checkUsername'].indexOf(ctx.originalUrl)) === -1 && (!ctx.session || !ctx.session.username)) {
      ctx.body = 'Unauthorized';
      ctx.status = 401;
    } else {
      await next();
    }
  }
};

