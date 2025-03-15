import telemetry from 'telemetry-sh';

export class Logger {
  private logger: typeof telemetry;
  constructor(key: string, logger: typeof telemetry = telemetry) {
    this.logger = telemetry;
    this.logger.init(key);
  }
  info(data: unknown, message: string) {
    this.logger.log(message, data);
  }
  error(data: unknown, message: string) {
    this.logger.log(message, data);
  }
  warn(data: unknown, message: string) {
    this.logger.log(message, data);
  }
  debug(data: unknown, message: string) {
    this.logger.log(message, data);
  }
}
