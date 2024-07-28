import type { LoggerService } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import type { ResolvedServerUrls } from 'vite'

export function printServerUrls(urls: ResolvedServerUrls, logger: LoggerService = new Logger('Vite')) {
  for (const url of urls.local)
    logger.log(`Local: ${url}`)
  for (const url of urls.network)
    logger.log(`Network: ${url}`)
}
