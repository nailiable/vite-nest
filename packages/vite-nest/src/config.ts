import type { swc } from './plugin-swc'

export function getDefaultSwcConfig(): Parameters<typeof swc>[0] {
  return {
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
  }
}
