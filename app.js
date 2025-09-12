// 各个依赖包
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const logger = require('./logger');
const config = require('./config');

// 路由文件引用
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const adPlanRouter = require('./routes/adPlan');
const adCreativesRouter = require('./routes/adCreatives');
const adminUsersRouter = require('./routes/admin/users');
const adminAdPlanRouter = require('./routes/admin/adPlan');
const adminAdCreativeRouter = require('./routes/admin/adCreative');
const adminAccountRouter = require('./routes/admin/account');

// Express 引用实例化
const app = express();

// 视图模板设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 使用配置的日志级别
if (config.logging.level === 'debug') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 配置CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// 使用对 Post 来的数据 json 格式化（使用API配置的超时时间）
app.use(express.json({ limit: '10mb' }));

// 使用对 表单提交的数据 进行格式化
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 设置API超时
app.use((req, res, next) => {
  req.setTimeout(config.api.timeout);
  res.setTimeout(config.api.timeout);
  next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/home', homeRouter);
app.use('/api/ad-plans', adPlanRouter);
app.use('/api/ad-creatives', adCreativesRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/ad-plans', adminAdPlanRouter);
app.use('/api/admin/ad-creatives', adminAdCreativeRouter);
app.use('/api/admin/account', adminAccountRouter);

//  捕捉404错误 catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



//这里错误处理改成自己的

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

/**
* error handler
* @private
*/
// 处理非404的错误（throw 出来的错误)
const _errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} ` + err.message)
  const errorMsg = err.message
  res.status(err.status || 500).json({
    code: -1,
    success: false,
    message: errorMsg,
    data: {}
  })
}
app.use(_errorHandler)

module.exports = app;
