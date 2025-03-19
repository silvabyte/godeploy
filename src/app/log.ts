import pino from 'pino';

export class Logger {
  level: string;
  private logger: pino.Logger;
  constructor(logger: pino.Logger = pino(), level: string = 'info') {
    this.logger = logger;
    this.level = level;
  }
  setLevel(level: string) {
    this.level = level;
  }
  info(data: unknown, message?: string) {
    this.logger.info(data, message);
  }
  error(error: unknown, message?: string) {
    this.logger.error(error, message);
  }
  warn(data: unknown, message?: string) {
    this.logger.warn(data, message);
  }
  debug(data: unknown, message?: string) {
    this.logger.debug(data, message);
  }
  trace(data: unknown, message?: string) {
    this.logger.trace(data, message);
  }
  fatal(error: unknown) {
    this.logger.fatal(error);
  }
  silent(data: unknown, message?: string) {
    this.logger.silent(data, message);
  }
  child(bindings: pino.Bindings, options?: pino.ChildLoggerOptions) {
    return new Logger(this.logger.child(bindings, options));
  }
}
