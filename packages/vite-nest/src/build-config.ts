import type { InlineConfig } from 'vite'
import { getDefaultSwcConfig } from './config'
import { nest } from './plugin-nest'
import type { swc } from './plugin-swc'

export interface BuildConfigOptions {
  overrideSwcOptions?: Parameters<typeof swc>[0]
  entryPath?: string
  minify?: boolean
  bootstrap?: string
}

export function getBuildInlineConfig({
  overrideSwcOptions = getDefaultSwcConfig(),
  entryPath,
  minify,
  bootstrap,
}: BuildConfigOptions = {}): InlineConfig {
  return {
    appType: 'custom',
    esbuild: false,
    build: {
      minify: minify === true ? 'terser' : false,
      terserOptions: {
        keep_classnames: true,
      },
    },
    plugins: [
      nest({
        entryPath,
        rewriteSwcOptions: overrideSwcOptions,
        bootstrap,
      }),
    ],
  }
}
