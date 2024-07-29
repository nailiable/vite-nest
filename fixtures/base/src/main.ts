import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const app = await NestFactory.create(AppModule, {
  abortOnError: false,
})

export default app
