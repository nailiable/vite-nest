import type { InlineConfig } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'
import { Logger } from '@nestjs/common'
import { getDevelopmentInlineConfig } from './dev-config'
import { printServerUrls } from './logger'
import type { swc } from './plugin-swc'

export interface CreateServerOptions {
  entryPath?: string
  rewriteSwcOptions?: Parameters<typeof swc>[0]
  vite?: { type: 'merge' | 'rewrite', config: InlineConfig }
}

export async function createServer(opts: CreateServerOptions = {}) {
  const defaultDevelopmentConfig = getDevelopmentInlineConfig({ entryPath: opts.entryPath })
  const viteServer = await createViteServer(
    opts.vite?.type === 'merge'
      ? mergeConfig(defaultDevelopmentConfig, opts.vite.config)
      : opts.vite?.config || defaultDevelopmentConfig,
  )

  return {
    ...viteServer,
    printUrls: async () => {
      printServerUrls(viteServer.resolvedUrls, new Logger('Vite'))
    },
  }
}
