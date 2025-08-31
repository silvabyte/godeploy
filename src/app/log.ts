import * as HyperDx from '@hyperdx/node-opentelemetry'
import type { FastifyRequest } from 'fastify'
import pino from 'pino'

interface RequestUser {
  user_id: string
  tenant_id: string
}

interface RequestLogData {
  route: string
  method: string
  auth: string
  reqId: string
  userInfo: string
  message: string
}

const defaultLogger =
  process.env.NODE_ENV !== 'development'
    ? pino(
        pino.transport({
          mixin: HyperDx.getPinoMixinFunction,
          targets: [
            HyperDx.getPinoTransport('info', {
              // Send logs info and above to HyperDX
              detectResources: true,
            }),
            {
              // Also log to console/stdout in production
              target: 'pino/file',
              options: {
                // @ts-expect-error destination is a valid option
                destination: 1, // 1 = stdout
              },
            },
          ],
        }),
      )
    : pino()

export class Logger {
  level: string
  private logger: pino.Logger

  constructor(logger: pino.Logger = defaultLogger, level: string = 'info') {
    this.logger = logger
    this.level = level
  }

  setLevel(level: string) {
    this.level = level
  }

  info(data: unknown, message?: string) {
    this.logger.info(data, message)
  }

  error(error: unknown, message?: string) {
    this.logger.error(error, message)
  }

  warn(data: unknown, message?: string) {
    this.logger.warn(data, message)
  }

  debug(data: unknown, message?: string) {
    this.logger.debug(data, message)
  }

  trace(data: unknown, message?: string) {
    this.logger.trace(data, message)
  }

  fatal(error: unknown) {
    this.logger.fatal(error)
  }

  silent(data: unknown, message?: string) {
    this.logger.silent(data, message)
  }

  child(bindings: pino.Bindings, options?: pino.ChildLoggerOptions) {
    return new Logger(this.logger.child(bindings, options))
  }

  private maskAuthHeader(authHeader: string | undefined): string {
    if (!authHeader) return 'none'
    const [type, token] = authHeader.split(' ')
    return token ? `${type} ${token.substring(0, 10)}...` : 'none'
  }

  private formatUserInfo(user: RequestUser | undefined): string {
    if (!user) return 'no user'
    return `user_id: ${user.user_id.substring(0, 8)}..., tenant_id: ${user.tenant_id.substring(0, 8)}...`
  }

  logRequest(request: FastifyRequest, message: string) {
    const logData: RequestLogData = {
      route: request.url,
      method: request.method,
      auth: this.maskAuthHeader(request.headers.authorization),
      reqId: request.id,
      userInfo: this.formatUserInfo(request.user as RequestUser),
      message,
    }

    this.info(logData)
  }
}
