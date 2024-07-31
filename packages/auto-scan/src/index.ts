import { join } from 'node:path'
import { cwd } from 'node:process'
import { ConfigEnv, Plugin } from 'vite'
import type { NestAutoScanOptions } from './types'
import { getAutoScanCode } from './auto-scan'
import { getRootScanCode } from './root-scan'

export function NestAutoScan(options: NestAutoScanOptions = {}): Plugin | Plugin[] {
  const opts: NestAutoScanOptions = {
    entryPath: join(cwd(), './src/main.ts'),
    rootModulePath: join(cwd(), './src/app.module.ts'),
    moduleSuffix: ['.module.ts'],
    ...(options || {}),
  }

  const autoScanCode = getAutoScanCode(opts)
  const rootScanCode = getRootScanCode()
  globalThis.viteEnv = {} as ConfigEnv
  globalThis.__hasTransformedSet = new Set<string>()

  return {
    name: 'vite-nest-auto-scan',
    config(_, env) {
      globalThis.viteEnv = env
    },
    async transform(code, id) {
      if (id.endsWith('.d.ts')) {
        return null
      }
      else if (opts.moduleSuffix.some(suffix => id.endsWith(suffix))) {
        if ((globalThis.viteEnv as ConfigEnv).command === 'build' && globalThis.__hasTransformedSet.has(id))
          return null

        // apply auto scan code
        code = `${autoScanCode}${code}`
        if (id === opts.rootModulePath)
          code = `${rootScanCode}${code}`
        globalThis.__hasTransformedSet.add(id)
        return { code, map: null }
      }
      else {
        return null
      }
    },
  }
}
