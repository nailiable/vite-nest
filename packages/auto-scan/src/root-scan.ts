import { NestAutoScanOptions } from './types'
import { generateRandomString } from './utils'

export function getRootScanCode(opts: NestAutoScanOptions): string {
  const prefix = generateRandomString(5)
  const rootScanOptions = opts.rootScanOptions || {}
  const providersGlob: string[] = rootScanOptions.providersGlob || ['./services/**/*.service.ts', './providers/**/*.service.ts', './services/**/*.provider.ts', './providers/**/*.provider.ts']
  const controllersGlob: string[] = rootScanOptions.controllersGlob || ['./controllers/**/*.controller.ts']
  const importsGlob: string[] = rootScanOptions.importsGlob || ['./modules/**/*.module.ts']

  return `import { join as ${prefix}join, relative as ${prefix}relative } from 'node:path';import ${prefix}glob from 'fast-glob';
  
  const ${prefix}_service_mods = await (async () => {
    const ${prefix}_service_modPromises = import.meta.glob(${JSON.stringify(providersGlob)})
    const ${prefix}_service_objectMods = {}
    for (const key in ${prefix}_service_modPromises)
      ${prefix}_service_objectMods[key] = await ${prefix}_service_modPromises[key]()

    return ${prefix}_service_objectMods
  })();
  
  const ${prefix}_controller_mods = await (async () => {
    const ${prefix}_controller_modPromises = import.meta.glob(${JSON.stringify(controllersGlob)})
    const ${prefix}_controller_objectMods = {}
    for (const key in ${prefix}_controller_modPromises)
      ${prefix}_controller_objectMods[key] = await ${prefix}_controller_modPromises[key]()

    return ${prefix}_controller_objectMods
  })();

  const ${prefix}_module_mods = await (async () => {
    const ${prefix}_module_modPromises = import.meta.glob(${JSON.stringify(importsGlob)})
    const ${prefix}_module_objectMods = {}
    for (const key in ${prefix}_module_modPromises)
      ${prefix}_module_objectMods[key] = await ${prefix}_module_modPromises[key]()

    return ${prefix}_module_objectMods
  })();
  
  function ${prefix}_root_isClass(v) {
    return typeof v === 'function' && v.toString().startsWith('class')
  }

  globalThis.RootScan = function() {
    return (target) => {
      for (const modPath in ${prefix}_service_mods) {
        const mod = ${prefix}_service_mods[modPath]
        for (const key in mod) {
          if (!${prefix}_root_isClass(mod[key]))
            continue

          const isInjectable = Reflect.getMetadata('__injectable__', mod[key])
          if (isInjectable) {
            const oldProvidersArray = Reflect.getMetadata('providers', target) || []
            Reflect.defineMetadata('providers', [...oldProvidersArray, mod[key]], target)
          }
        }
      }
      
      for (const modPath in ${prefix}_controller_mods) {
        const mod = ${prefix}_controller_mods[modPath]
        for (const key in mod) {
          if (!${prefix}_root_isClass(mod[key]))
            continue

          const isController = Reflect.getMetadata('__controller__', mod[key])
          if (isController) {
            const oldControllersArray = Reflect.getMetadata('controllers', target) || []
            Reflect.defineMetadata('controllers', [...oldControllersArray, mod[key]], target)
          }
        }
      }
      
      for (const modPath in ${prefix}_module_mods) {
        const mod = ${prefix}_module_mods[modPath]
        for (const key in mod) {
          if (!${prefix}_root_isClass(mod[key]))
            continue

          const oldModulesArray = Reflect.getMetadata('imports', target) || []
          Reflect.defineMetadata('imports', [...oldModulesArray, mod[key]], target)
        }
      }
    }
  };`
}
