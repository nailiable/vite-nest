import { resolve } from 'node:path'
import { Plugin, defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import 'vite-nest'

function autoScan(): Plugin {
  function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength)
      result += characters.charAt(randomIndex)
    }
    return result
  }

  const prefix = generateRandomString(5)

  function getGenerateCode() {
    return `import { join as ${prefix}join, relative as ${prefix}relative } from 'node:path';import ${prefix}glob from 'fast-glob';

    const ${prefix}mods = await (async () => {
    const ${prefix}modPromises = import.meta.glob('./**/*.ts')
      const ${prefix}objectMods = {}
      for (const key in ${prefix}modPromises)
        ${prefix}objectMods[key] = await ${prefix}modPromises[key]()

      return ${prefix}objectMods
    })()

    function ModuleScan() {
      return (target) => {
        for (const modPath in ${prefix}mods) {
          const mod = ${prefix}mods[modPath]
          for (const key in mod) {
            function ${prefix}isClass(v) {
              return typeof v === 'function' && v.toString().startsWith('class')
            }
            if (!${prefix}isClass(mod[key]))
              continue

            const isController = Reflect.getMetadata('__controller__', mod[key])
            if (isController) {
              const oldControllersArray = Reflect.getMetadata('controllers', target) || []
              Reflect.defineMetadata('controllers', [...oldControllersArray, mod[key]], target)
            }

            const isInjectable = Reflect.getMetadata('__injectable__', mod[key])
            if (isInjectable) {
              const oldProvidersArray = Reflect.getMetadata('providers', target) || []
              Reflect.defineMetadata('providers', [...oldProvidersArray, mod[key]], target)
            }
          }
        }
      }
    }`
  }

  globalThis.hasTransformed = false
  globalThis.viteEnv = {}

  return {
    name: 'vite-nest-auto-scan',
    config(_, env) {
      globalThis.viteEnv = env
    },
    async transform(code, id) {
      const allowRebuild = globalThis.viteEnv.command === 'build' ? !globalThis.hasTransformed : true
      if (id.includes('app.module.ts'))
        return null

      if (id.endsWith('.module.ts') && allowRebuild) {
        globalThis.hasTransformed = true
        return { code: `${getGenerateCode()}${code}`, moduleSideEffects: 'no-treeshake' }
      }
    },
  }
}

export default defineConfig({
  viteNestOptions: {
    entryPath: './src/main.ts',
    bootstrap: 'bootstrap.mjs',
    rewriteSwcOptions: {
      module: {
        type: 'es6',
      },
      jsc: {
        target: 'es2021',
        loose: true,
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    },
  },

  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
  },

  plugins: [
    AutoImport({
      imports: [
        {
          from: '@nestjs/common',
          imports: ['Module', 'Controller', 'Get', 'Post', 'Put', 'Patch', 'Delete', 'Body', 'Param', 'Query', 'Req', 'Res', 'Next', 'Render', 'Inject', 'Injectable', 'UseGuards', 'UseInterceptors', 'UsePipes', 'UseFilters'],
        },
      ],
      dts: './src/auto-imports.d.ts',
      dirs: [
        'src/decorators',
        'src/modules/**/*.module.ts',
      ],
    }),

    autoScan(),
  ],
})
