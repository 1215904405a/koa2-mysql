var child_process = require('child_process');
var cluster = require('cluster');
var config = { watch: true }; //require('./app/config');

var start = Date.now();

// 正式环境先安装依赖 方便运维部署
if (!config.watch) {
  // child_process.execSync('yarn add colors@1.1.2', { stdio: ['pipe'] });
  // var colors = require('colors/safe');
  // // 停止所有进程
  // try {
  //   console.log(colors.red('警告:开始停止商户端进程'));
  //   child_process.execSync('pm2 delete trader');
  // } catch (e) {} finally {
  //   console.log(colors.red('警告:已经停止商户端进程'));
  // }

  // // 静态工程的依赖和构建
  // console.info(colors.green('前台:开始构建REACT工程'));
  // child_process.execSync('yarn build', {
  //   stdio: 'inherit',
  //   cwd: './assets/react',
  // });

  // console.info(colors.cyan('服务:安装Web工程依赖包'));
  // child_process.execSync('yarn install', {
  //   stdio: 'inherit',
  // });

  // // 正式环境采用PM2管理进程
  // child_process.execSync('NODE_ENV=production pm2 start app/index.js --name=trader -o /dev/null -e /dev/null -i ' + config.cluster, {
  //   stdio: 'inherit',
  // });

  // console.log(colors.green('发布完成，累计耗时:' + Math.round((Date.now() - start) / 1000) + 'S'));
}
// 开发环境分布式启动
else {
  // 设置主进程
  cluster.setupMaster({ exec: './app/index', });

  // 启动多进程
  // var nums = require('os').cpus().length;
  var nums = 1;
  for (var i = 0; i < nums; i++) {
    cluster.fork();
  }
}
