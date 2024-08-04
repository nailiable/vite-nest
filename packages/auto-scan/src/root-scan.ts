import { NestAutoScanOptions } from './types'
import { generateRandomString } from './utils'

export function getRootScanCode(opts: NestAutoScanOptions): string {
  const prefix = generateRandomString(5)
  const rootScanOptions = opts.rootScanOptions || {}
  const providersGlob: string[] = rootScanOptions.providersGlob || ['./services/**/*.service.ts', './providers/**/*.service.ts', './services/**/*.provider.ts', './providers/**/*.provider.ts']
  const controllersGlob: string[] = rootScanOptions.controllersGlob || ['./controllers/**/*.controller.ts']
  const importsGlob: string[] = rootScanOptions.importsGlob || ['./modules/**/*.module.ts']

  return `import { join as ${prefix}join, relative as ${prefix}relative } from 'node:path';import ${prefix}glob from 'fast-glob';
  
  const ${prefix}_service_mods = import.meta.glob(${JSON.stringify(providersGlob)}, { eager: true });
  const ${prefix}_controller_mods = import.meta.glob(${JSON.stringify(controllersGlob)}, { eager: true })
  const ${prefix}_module_mods = import.meta.glob(${JSON.stringify(importsGlob)}, { eager: true })
  
  function ${prefix}_root_isClass(v) {
    return typeof v === 'function' && v.toString().startsWith('class')
  }

  function RootScan() {
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
          
          const isRootScanModule = Reflect.getMetadata('__root_scan__', mod[key])
          if (isRootScanModule) {
            const oldModulesArray = Reflect.getMetadata('imports', target) || []
            Reflect.defineMetadata('imports', [...oldModulesArray, mod[key]], target)
          }
        }
      }
    }
  };`
}
