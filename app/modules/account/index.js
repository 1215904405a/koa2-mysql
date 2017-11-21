const Router = require('koa-router');
const router = module.exports = new Router();
// const service = require('./service');

router.redirect('/login', '/account/login');
router.redirect('/logout', '/account/logout');
router.redirect('/register', '/account/register');

//建立连接
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mydatabase', 'root', '123456', {
  host: "127.0.0.1",
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialect: 'mysql'
});

//建立模型
const User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
});

// force: true 如果表已经存在，将会丢弃表
User.sync({ force: true }).then(() => {
  // 表已创建
  return User.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});

//返回数据库账户数据
router.get('/account/query', async(ctx, next) => {
  await User.findAll().then(users => {
    console.log(users);
    ctx.body = { query: users };
  });
  // await sequelize.query("SELECT * FROM future", {
  //   logging: console.log,
  //   plain: false,
  //   raw: true
  // }).then(myTableRows => {
  //   ctx.body = { query: myTableRows };
  // });
});

// 登录
// router.get('/account/login', async(ctx, next) => {
//   let captcha = {};
//   captcha = await service.getCaptcha(ctx).then(function(captcha) {
//     return captcha;
//   });
//   ctx.body = ctx.render('templates/login.html', captcha);
// });

// router.post('/account/login', async(ctx, next) => {
//   let form = ctx.request.body;
//   await service.login(ctx, form).then(async function(data) {
//     ctx.session = {
//       providerId: data.shAccount.providerId,
//       puserId: data.shAccount.puserId,
//       userToken: data.userToken
//     };

//     let provider = await service.getProvider(ctx, data.shAccount.puserId);
//     ctx.session.provider = provider;
//     let menusRights = await service.getMenusRights(ctx);
//     menusRights = getMenusList(menusRights);
//     ctx.session.rights = menusRights;

//     ctx.redirect(ctx.query.next || '/');

//   }, function(rej) {
//     return service.getCaptcha(ctx).then(function(captcha) {
//       ctx.body = ctx.render('templates/login.html', form, captcha, {
//         error: rej.message || '您的账户不存在或密码错误'
//       });
//     });
//   });

// });

// router.get(/^\/(account|about)(?:\/|$)/, ctx => {
//   ctx.body = ctx.render('../../views/react.html', {
//     member: ctx.session.member,
//     project: ctx.session.project,
//   });
// });
