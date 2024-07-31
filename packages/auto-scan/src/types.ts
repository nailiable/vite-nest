export interface NestAutoScanOptions {
  /** @default ['.module.ts'] */
  moduleSuffix?: string[]
  /** @default join(cwd(), './src/app.module.ts') */
  rootModulePath?: string
  /** @default join(cwd(), './src/main.ts') */
  entryPath?: string
}
