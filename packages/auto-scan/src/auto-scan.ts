import { dirname, relative } from 'node:path'
import { NestAutoScanOptions } from './types'
import { generateRandomString } from './utils'

export function getAutoScanCode(opts: NestAutoScanOptions) {
  const prefix = generateRandomString(5)

  return `import { join as ${prefix}join, relative as ${prefix}relative } from 'node:path';import ${prefix}glob from 'fast-glob';

  const ${prefix}mods = import.meta.glob(['./**/*.ts', '!./${relative(dirname(opts.entryPath), opts.entryPath)}', '!**/*.d.ts'], { eager: true })

  function ${prefix}isClass(v) {
    return typeof v === 'function' && v.toString().startsWith('class')
  }

  function AutoScan(canRootScan = true) {
    return (target) => {
      Reflect.defineMetadata('__root_scan__', typeof canRootScan === 'boolean' ? canRootScan : true, target)
      for (const modPath in ${prefix}mods) {
        const mod = ${prefix}mods[modPath]
        for (const key in mod) {
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

            const oldExportsArray = Reflect.getMetadata('exports', target) || []
            Reflect.defineMetadata('exports', [...oldExportsArray, mod[key]], target)
          }
        }
      }
    }
  };`
}
