import { argv } from 'node:process'
import { Command } from 'commander'
import { loadConfig } from 'c12'
import type { UserConfig } from 'vite'
import { mergeConfig } from 'vite'
import { name, version } from '../package.json'
import { createServer } from './dev'
import { build } from './build'
import type { ViteNestOptions } from './vite-nest-config'

interface ReadViteConfigOptions extends UserConfig {
  viteNestOptions?: ViteNestOptions
}

async function readViteConfig() {
  return await loadConfig<ReadViteConfigOptions>({
    name: 'vite',
  })
}

const program = new Command()
  .name(name)
  .version(version, '-v, --version', 'Output the current version.')
  .description('A Vite plugin for Nest.js.')

const devCommand = new Command('dev')
  .alias('d')
  .description('Start the development server.')
  .argument('[entryPath]', 'Entry path.')
  .option('-p, --port <port>', 'Port number.', '3000')
  .option('--host <host>', 'Host name.', true)
  .action(async (entryPath, { host, port }) => {
    const viteConfig = await readViteConfig()

    const viteServer = await createServer({
      entryPath: entryPath || viteConfig.config.viteNestOptions?.entryPath || './src/main.ts',
      vite: {
        type: 'merge',
        config: mergeConfig(viteConfig.config, {
          server: {
            host,
          },
        }),
      },
      rewriteSwcOptions: viteConfig.config.viteNestOptions?.rewriteSwcOptions,
    })
    await viteServer.listen(port ? Number(port) : undefined)
    viteServer.printUrls()
  })
program.addCommand(devCommand)

const buildCommand = new Command('build')
  .alias('b')
  .description('Build the project.')
  .argument('[entryPath]', 'Entry path.')
  .option('-m, --minify', 'Minify the output.', false)
  .action(async (entryPath, { minify }) => {
    const viteConfig = await readViteConfig()

    await build({
      entryPath: entryPath || viteConfig.config.viteNestOptions?.entryPath || './src/main.ts',
      minify,
      vite: {
        type: 'merge',
        config: viteConfig.config,
      },
      rewriteSwcOptions: viteConfig.config.viteNestOptions?.rewriteSwcOptions,
      bootstrap: viteConfig.config.viteNestOptions?.bootstrap,
    })
  })
program.addCommand(buildCommand)

program.parse(argv)
