const _ = require('lodash');
const Koa = require('koa'); //Koa2 requires node v7.6.0 or higher
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const colors = require('colors/safe');
const nunjucks = require('nunjucks');
const parser = require('koa-body');
const session = require('koa-session');
const send = require('koa-send');
const fs = require('fs');
// const fs = require('mz/fs'); //mz帮助返回promise对象（async/await是基于Promise实现的，它不能用于普通的回调函数）  配合await使用

// init koa
const app = module.exports = new Koa();

// config session based on cookie     key sort: node/ios/android
app.keys = ['NfR+8tVpZpMsfBaItk/eKiWRnr+aPwCxG9q851+krpQ=', 'tdX7CoARC+2EYUYexE12FDqXwBJ16dokDDZeGLwlbqY=', '5kLtC4/pkhk6FMuNjJ8Ri6QAmbcQ7iBs9D5LFA8PMV4='];
app.use(session(app, {
  key: 'T'
}));

// config nunjucks
let env = new nunjucks.Environment(new nunjucks.FileSystemLoader(['app'], {
  watch: true,
}));

// elapsed time
app.use(async(ctx, next) => {
  let start = Date.now();
  await next();
  let ms = Date.now() - start;
  ctx.set('X-Response-Time', ms + 'ms');
});

// error handler
app.use(async(ctx, next) => {
  try {
    await next();
  } catch (e) {
    logger.error(e.message);
    logger.error(ctx.status, ctx.url, ctx.method, ctx.headers);
  } finally {
    if (ctx.status !== 200) {
      // ajax
      // if (ctx.accepts('html', 'json') === 'json') {
      //   ctx.body = ctx.render(ctx.status, '服务异常');
      // }
      // // html
      // else {
      //   let code = [403, 404, 500].indexOf(ctx.status) !== -1 ? ctx.status : 500;
      //   ctx.body = ctx.render(util.format('./views/%s.html', code));
      // }
    }
  }
});

// minify html
// app.use(minify({
//   minifyJS: { mangle: false, },
//   minifyCSS: true,
//   collapseWhitespace: true,
//   keepClosingSlash: true,
//   removeComments: true,
//   processScripts: [],
// }));

// parse form
app.use(parser({
  strict: false,
  jsonLimit: 1024 * 1024 * 2, // 2MB
  formLimit: 1024 * 1024 * 2, // 2MB
  textLimit: 1024 * 1024 * 2, // 2MB
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '../upload'),
  }
}));

// 递归遍历目录
const walk = exports.walk = function(dir, deep) {
  let list = fs.readdirSync(dir);
  let pending = list.length;

  let results = [];
  list.filter(function(file) {
    // 不包含隐藏文件
    return !file.startsWith('.');
  }).forEach(function(file) {
    file = path.resolve(dir, file);
    let stat = fs.statSync(file);
    if (deep && stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

// import modules
walk(path.join(__dirname, 'modules')).forEach(function(path) {
  let router = require(path);
  if (typeof router.routes === 'function') {
    app.use(router.routes()).use(router.allowedMethods());
  }
});

app.listen(4001, function() {
  let decorator = new Array(40).fill('*').join('');
  console.info(colors.cyan(decorator));
  console.info(colors.green(`成功:服务已经启动, http://localhost:${4001}`));
  console.info(colors.cyan(decorator));
});
