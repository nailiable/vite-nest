import { join } from 'node:path'
import { cwd } from 'node:process'
import type { ConfigEnv, Plugin } from 'vite'
import { INestApplication } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import commonjs from 'vite-plugin-commonjs'
import { swc } from './plugin-swc'
import { getDefaultSwcConfig } from './config'

export interface NestPluginOptions {
  entryPath: string
  rewriteSwcOptions?: Parameters<typeof swc>[0]
  bootstrap?: string
}

export interface EntryModuleShape {
  default: INestApplication
  afterListen?: (port: number) => void | Promise<void>
  // customPrintUrlLogger?: (urls: ResolvedServerUrls) => LoggerService | void | false | Promise<LoggerService | void | false>
}

export function nest(opts: NestPluginOptions = { entryPath: join(cwd(), './src/main.ts') }): Plugin[] {
  const defaultSwcConfig = getDefaultSwcConfig()
  const virtualModuleId = 'virtual:vite-nest'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  let port = 3000
  let env: ConfigEnv

  return [
    swc(opts.rewriteSwcOptions || defaultSwcConfig),
    commonjs(),
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
      async configureServer(viteServer) {
        let mod: EntryModuleShape | null = null
        async function loadModule() {
          if (mod && mod.default && mod.default.close) {
            await mod.default.close()
            mod = null
          }

          mod = await viteServer.ssrLoadModule(opts.entryPath || './src/main.ts') as EntryModuleShape
          if (!mod || !mod.default || !(mod.default instanceof NestApplication))
            throw new TypeError('The entry module\'s default export must export a NestApplication instance.')
        }

        viteServer.middlewares.use(async (req, res) => {
          try {
            await loadModule()
            await mod.default.init()
            const instance = mod.default.getHttpAdapter().getInstance()
            if (instance && typeof instance === 'function') {
              instance(req, res)
            }
            else if (instance && typeof instance === 'object') {
              const objectApp = await instance.ready()
              objectApp.routing(req, res)
            }
          }
          catch (error) {
            console.error(error)
            res.statusCode = 500
            res.end('Internal server error')
          }
        })

        viteServer.watcher.on('all', async () => await loadModule())
      },
    },
  ]
}
