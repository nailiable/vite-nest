import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const app = await NestFactory.create(AppModule)
export default app
