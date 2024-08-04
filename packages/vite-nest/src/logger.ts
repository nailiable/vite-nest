import type { LoggerService } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import type { ResolvedServerUrls, Logger as ViteLogger } from 'vite'

export function printServerUrls(urls: ResolvedServerUrls, logger: LoggerService = new Logger('Vite')) {
  for (const url of urls.local)
    logger.log(`${'Local:'} ${url}`)
  for (const url of urls.network)
    logger.log(`${'Network:'} ${url}`)
}

export function createLogger(context: string = 'Vite'): ViteLogger {
  const logger = new Logger(context)
  let hasWarned = false
  let hasErrorLogged = false

  return {
    info(msg) {
      logger.log(msg)
    },
    warn(msg) {
      hasWarned = true
      logger.warn(msg)
    },
    error(msg) {
      hasErrorLogged = true
      logger.error(msg)
    },
    warnOnce(msg) {
      logger.warn(msg)
    },
    clearScreen() {
      // eslint-disable-next-line no-console
      console.clear()
    },
    get hasWarned() {
      return hasWarned
    },
    hasErrorLogged() {
      return hasErrorLogged
    },
  }
}
