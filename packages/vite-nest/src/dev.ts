import type { InlineConfig, ResolvedServerUrls } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'
import { NestApplication } from '@nestjs/core'
import { type INestApplication, Logger, type LoggerService } from '@nestjs/common'
import { getDevelopmentInlineConfig } from './dev-config'
import { printServerUrls } from './logger'
import type { swc } from './plugin-swc'

export interface CreateServerOptions {
  entryPath?: string
  rewriteSwcOptions?: Parameters<typeof swc>[0]
  vite?: { type: 'merge' | 'rewrite', config: InlineConfig }
}

export interface EntryModuleShape {
  default: INestApplication
  afterListen?: (port: number) => void | Promise<void>
  customPrintUrlLogger?: (urls: ResolvedServerUrls) => LoggerService | void | false | Promise<LoggerService | void | false>
}

export async function createServer(opts: CreateServerOptions = {}) {
  const defaultDevelopmentConfig = getDevelopmentInlineConfig({ entryPath: opts.entryPath })
  const viteServer = await createViteServer(
    opts.vite?.type === 'merge'
      ? mergeConfig(defaultDevelopmentConfig, opts.vite.config)
      : opts.vite?.config || defaultDevelopmentConfig,
  )
  let mod: EntryModuleShape | null = null

  async function loadModule() {
    if (mod && mod.default && mod.default.close) {
      await mod.default.close()
      mod = null
    }

    mod = await viteServer.ssrLoadModule(opts.entryPath || './src/main.ts') as EntryModuleShape
    if (!mod || !mod.default || !(mod.default instanceof NestApplication))
      throw new TypeError('The entry module\'s default export must export a NestApplication instance.')

    viteServer.middlewares.use(async (req, res) => {
      await mod.default.init()
      const instance = mod.default.getHttpAdapter().getInstance()
      if (instance && typeof instance === 'function') {
        instance(req, res)
      }
      else if (instance && typeof instance === 'object') {
        const objectApp = await instance.ready()
        objectApp.routing(req, res)
      }
    })
  }
  await loadModule()

  viteServer.watcher.on('all', async () => await loadModule())
  return {
    ...viteServer,
    printUrls: async () => {
      const loggerService = await mod?.customPrintUrlLogger?.(viteServer.resolvedUrls)
      if (loggerService === false)
        return void 0
      printServerUrls(viteServer.resolvedUrls, loggerService || new Logger('Vite'))
    },
  }
}
