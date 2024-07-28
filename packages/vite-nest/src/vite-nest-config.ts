import type { swc } from './plugin-swc'

export interface ViteNestOptions {
  entryPath: string
  bootstrap?: string
  rewriteSwcOptions?: Parameters<typeof swc>[0]
}

declare module 'vite' {
  interface UserConfig {
    viteNestOptions?: ViteNestOptions
  }
}
