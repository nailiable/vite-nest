import type { LoggerService } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import type { ResolvedServerUrls, Logger as ViteLogger } from 'vite'

export function printServerUrls(urls: ResolvedServerUrls, logger: LoggerService = new Logger('Vite')) {
  for (const url of urls.local)
    logger.log(`${'Local:'} ${url}`)
  for (const url of urls.network)
    logger.log(`${'Network:'} ${url}`)
}

export class NestStyleLogger implements ViteLogger {
  private readonly logger: Logger

  constructor(context: string) {
    this.logger = new Logger(context)
  }

  info(msg: string): void {
    this.logger.log(msg)
  }

  hasWarned: boolean = false

  warn(msg: string): void {
    this.hasWarned = true
    this.logger.warn(msg)
  }

  private _hasErrorLogged: boolean = false
  error(msg: string): void {
    this._hasErrorLogged = true
    this.logger.error(msg)
  }

  warnOnce(msg: string): void {
    this.logger.warn(msg)
  }

  clearScreen(): void {
    // eslint-disable-next-line no-console
    console.clear()
  }

  hasErrorLogged() {
    return this._hasErrorLogged
  }
}
