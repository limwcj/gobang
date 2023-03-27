module.exports = () => {
  return async function checkLogin(ctx, next) {
    if (!ctx.originalUrl.startsWith('/api')) return await next();
    if ((['/api/user/login', '/api/user/register', '/api/user/checkUsername'].indexOf(ctx.originalUrl)) === -1 && (!ctx.session || !ctx.session.username)) {
      ctx.body = 'Unauthorized';
      ctx.status = 401;
    } else {
      await next();
    }
  }
};

