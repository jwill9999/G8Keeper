import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { Application, Request, Response } from 'express';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

interface MorganRequest extends Request {
  _startAt?: [number, number];
}

interface MorganResponse extends Response {
  _startAt?: [number, number];
}

morgan.token('response-time-ms', (req: MorganRequest, res: MorganResponse) => {
  const startAt = req._startAt;
  const resStartAt = res._startAt;

  if (!startAt || !resStartAt) {
    return '-';
  }
  const ms = (resStartAt[0] - startAt[0]) * 1000 + (resStartAt[1] - startAt[1]) / 1000000;
  return ms.toFixed(3);
});

const customFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

export default {
  console: morgan('dev'),
  file: morgan(customFormat, { stream: accessLogStream }),
  combined: (app: Application): void => {
    app.use(morgan('dev'));
    app.use(morgan(customFormat, { stream: accessLogStream }));
  },
};
