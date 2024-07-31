import { LoggerService } from '@nestjs/common'

export interface RootScanOptions {
  providersGlob?: string[]
  controllersGlob?: string[]
  importsGlob?: string[]
}

export interface NestAutoScanOptions {
  /** @default ['.module.ts'] */
  moduleSuffix?: string[]
  /** @default join(cwd(), './src/app.module.ts') */
  rootModulePath?: string
  /** @default join(cwd(), './src/main.ts') */
  entryPath?: string
  rootScanOptions?: RootScanOptions
  enableLogger?: boolean | LoggerService
}
