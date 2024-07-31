import { join } from 'node:path'
import { cwd } from 'node:process'
import { ConfigEnv, Plugin } from 'vite'
import { Logger } from '@nestjs/common'
import Chalk from 'chalk'
import type { NestAutoScanOptions } from './types'
import { getAutoScanCode } from './auto-scan'
import { getRootScanCode } from './root-scan'

export function NestAutoScan(options: NestAutoScanOptions = {}): Plugin | Plugin[] {
  const opts: NestAutoScanOptions = {
    entryPath: join(cwd(), './src/main.ts'),
    rootModulePath: join(cwd(), './src/app.module.ts'),
    moduleSuffix: ['.module.ts'],
    enableLogger: true,
    rootScanOptions: {
      providersGlob: ['./services/**/*.service.ts', './providers/**/*.service.ts', './services/**/*.provider.ts', './providers/**/*.provider.ts'],
      controllersGlob: (options.rootScanOptions || {}).controllersGlob || ['./controllers/**/*.controller.ts'],
      importsGlob: (options.rootScanOptions || {}).importsGlob || ['./modules/**/*.module.ts'],
    },
    ...(options || {}),
  }

  const RootScannerLogger = opts.enableLogger === true ? new Logger('RootScanner') : opts.enableLogger
  if (!globalThis.__isLoggedRootScanner && RootScannerLogger) {
    RootScannerLogger.log(Chalk.cyanBright(`Providers: ${Chalk.bold(opts.rootScanOptions.providersGlob)}`))
    RootScannerLogger.log(Chalk.cyanBright(`Controllers: ${Chalk.bold(opts.rootScanOptions.controllersGlob)}`))
    RootScannerLogger.log(Chalk.cyanBright(`Imports: ${Chalk.bold(opts.rootScanOptions.importsGlob)}`))
    globalThis.__isLoggedRootScanner = true
  }

  const autoScanCode = getAutoScanCode(opts)
  const rootScanCode = getRootScanCode(opts)
  globalThis.viteEnv = {} as ConfigEnv
  globalThis.__hasTransformedSet = new Set<string>()

  return {
    name: 'vite-nest-auto-scan',
    config(_, env) {
      globalThis.viteEnv = env
    },
    async transform(code, id) {
      if (id.endsWith('.d.ts')) {
        return null
      }
      else if (opts.moduleSuffix.some(suffix => id.endsWith(suffix))) {
        if ((globalThis.viteEnv as ConfigEnv).command === 'build' && globalThis.__hasTransformedSet.has(id))
          return null

        if (id !== opts.rootModulePath)
          // apply auto scan code
          code = `${autoScanCode}${code}`

        if (id === opts.rootModulePath)
          code = `${rootScanCode}${code}`
        globalThis.__hasTransformedSet.add(id)
        return { code, map: null }
      }
      else {
        return null
      }
    },
  }
}
