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

  function isViteTitleLog(msg: string) {
    if (msg.includes('VITE') && msg.includes('ready') && msg.includes('in') && msg.includes('ms'))
      return true
    return false
  }

  return {
    info(msg) {
      if (isViteTitleLog(msg))
        return
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
