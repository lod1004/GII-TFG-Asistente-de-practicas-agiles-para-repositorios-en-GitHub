const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
);

const dailyRotateMainLog = new DailyRotateFile({
    filename: path.join(logDir, 'main-log-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: logFormat,
    auditFile: path.join(logDir, 'audit.json')
});

const errorLog = new transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat
});

const logger = createLogger({
    level: 'info',
    transports: [
        errorLog,
        dailyRotateMainLog,
        new transports.Console({ format: logFormat })
    ]
});

module.exports = logger;