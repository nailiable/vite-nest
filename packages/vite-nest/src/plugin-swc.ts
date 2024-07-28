import { createFilter } from '@rollup/pluginutils'
import type { Compiler, Options } from '@swc/core'
import type { Plugin } from 'vite'

const hashRE = /#.*$/
const queryRE = /\?.*$/
function cleanUrl(url: string) {
  return url.replace(hashRE, '').replace(queryRE, '')
}

export function swc(options: Options): Plugin {
  let swc: Compiler
  // todo: load swc/tsconfig from config files
  const config: Options = {
    // options from swc config
    ...options,
  }

  const filter = createFilter(/\.(tsx?|jsx)$/, /\.js$/)

  return {
    name: 'rollup-plugin-swc',
    async transform(code, id) {
      if (filter(id) || filter(cleanUrl(id))) {
        if (!swc) {
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error
          swc = await import('@swc/core')
        }

        const result = await swc.transform(code, {
          ...config,
          filename: id,
        })
        return {
          code: result.code,
          map: result.map,
        }
      }
    },
  }
}
