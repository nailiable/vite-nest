import type { InlineConfig } from 'vite'
import type { swc } from './plugin-swc'
import { nest } from './plugin-nest'
import { getDefaultSwcConfig } from './config'

export interface DevelopmentConfigOptions {
  overrideSwcOptions?: Parameters<typeof swc>[0]
  port?: number | string
  host?: string
  entryPath?: string
}

export function getDevelopmentInlineConfig({
  host,
  port,
  overrideSwcOptions = getDefaultSwcConfig(),
  entryPath,
}: DevelopmentConfigOptions = {}): InlineConfig {
  return {
    appType: 'custom',
    server: {
      port: Number(port) || 3000,
      host: host || 'localhost',
    },
    esbuild: false,
    plugins: [
      nest({
        entryPath,
        rewriteSwcOptions: overrideSwcOptions,
      }),
    ],
  }
}
