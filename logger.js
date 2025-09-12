const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// 从配置文件获取日志路径
const logFilePath = config.logging.filePath;
const logDir = path.dirname(logFilePath);

// 创建日志目录（如果不存在）
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  // 使用配置文件中的日志级别
  level: config.logging.level,
  format: format.combine(
    format.label({ label: path.basename(require.main ? require.main.filename : 'app') }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      )
    }),
    new transports.File({
      filename: logFilePath,
      format: format.combine(
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      )
    })
  ]
});

module.exports = logger;