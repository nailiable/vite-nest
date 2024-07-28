import type { InlineConfig } from 'vite'
import { mergeConfig, build as viteBuild } from 'vite'
import { getBuildInlineConfig } from './build-config'
import type { swc } from './plugin-swc'

export interface BuildOptions {
  entryPath?: string
  minify?: boolean
  vite?: { type: 'merge' | 'rewrite', config: InlineConfig }
  rewriteSwcOptions?: Parameters<typeof swc>[0]
  bootstrap?: string
}

export async function build(opts: BuildOptions = {}) {
  const defaultBuildConfig = getBuildInlineConfig({ minify: opts.minify, entryPath: opts.entryPath, bootstrap: opts.bootstrap })

  await viteBuild(
    opts.vite?.type === 'merge'
      ? mergeConfig(defaultBuildConfig, opts.vite.config)
      : opts.vite?.config || defaultBuildConfig,
  )
}
