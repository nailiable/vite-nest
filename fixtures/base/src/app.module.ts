import { Type } from '@nestjs/common'

const modulePromises = import.meta.glob('./modules/**/*.module.ts')
const modules = Object.fromEntries(await Promise.all(Object.entries(modulePromises).map(async ([path, modulePromise]) => {
  const module = await modulePromise()
  return [path, module]
}))) as Record<string, { default?: Type }>

@Module({
  imports: [
    ...Object.values(modules)
      .map(module => module.default)
      .filter(Boolean),
  ],
})
@RootScan()
export class AppModule {}
