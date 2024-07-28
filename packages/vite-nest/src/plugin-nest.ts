import { join } from 'node:path'
import { cwd } from 'node:process'
import type { ConfigEnv, Plugin } from 'vite'
import { swc } from './plugin-swc'
import { getDefaultSwcConfig } from './config'

export interface NestPluginOptions {
  entryPath: string
  rewriteSwcOptions?: Parameters<typeof swc>[0]
  bootstrap?: string
}

export function nest(opts: NestPluginOptions = { entryPath: join(cwd(), './src/main.ts') }): Plugin[] {
  const defaultSwcConfig = getDefaultSwcConfig()
  const virtualModuleId = 'virtual:vite-nest'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  let port = 3000
  let env: ConfigEnv

  return [
    swc(opts.rewriteSwcOptions || defaultSwcConfig),
    {
      name: 'vite-plugin-nest',
      config(config, currentEnv) {
        env = currentEnv
        config.esbuild = false
        config.appType = 'custom'
        if (!config.build)
          config.build = {}
        config.build.ssr = opts.entryPath || join(cwd(), './src/main.ts')
        if (!config.build.rollupOptions)
          config.build.rollupOptions = {}
        config.build.rollupOptions.input = opts.entryPath || join(cwd(), './src/main.ts')
        return config
      },
      resolveId(id) {
        if (id === virtualModuleId)
          return resolvedVirtualModuleId
        return null
      },
      configResolved(config) {
        port = config.server.port
      },
      load(id) {
        if (id === resolvedVirtualModuleId || id === virtualModuleId)
          return `import app from "${opts.entryPath || join(cwd(), './src/main.ts')}";app.listen(${port});`
        return null
      },
      buildStart() {
        if (env.command === 'build') {
          this.emitFile({
            type: 'chunk',
            id: virtualModuleId,
            fileName: opts.bootstrap || 'bootstrap.mjs',
          })
        }
      },
    },
  ]
}
