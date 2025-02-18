import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { initializeTransactionalContext } from 'typeorm-transactional'

import { AppUtilsService, envService } from '@app/common'
import { getGrpcConnectionOptions, getTcpConnectionOptions, USERS_PACKAGE } from '@app/microservices'

import { AuthModule } from './auth.module'

const loggerContext = 'AuthMicroservice'
const logger = new Logger(loggerContext)

async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create<NestExpressApplication>(AuthModule)
  const configService = app.get(ConfigService)

  // Connect `Auth` TCP microservice
  const tcpHost = configService.get('AUTH_TCP_HOST')
  const tcpPort = configService.get('AUTH_TCP_PORT')
  app.connectMicroservice(getTcpConnectionOptions(tcpHost, tcpPort))
  logger.log(`📦 Auth microservice successfully connected: [Transport: TCP, Port: ${tcpPort}]`)

  // Connect `Users` gRPC microservice
  const usersGrpcHost = configService.get('USERS_GRPC_HOST')
  const usersGrpcPort = configService.get('USERS_GRPC_PORT')
  app.connectMicroservice(
    getGrpcConnectionOptions(`${usersGrpcHost}:${usersGrpcPort}`, join(__dirname, '../users.proto'), USERS_PACKAGE)
  )
  logger.log(`📦 Users microservice successfully connected: [Transport: gRPC, Port: ${usersGrpcPort}]`)

  // Serve static assets from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'))

  // Setup application
  const appUtilsService = new AppUtilsService(loggerContext)
  appUtilsService.setupApp(app, { swaggerTitle: 'Auth' })

  // Start all Microservices
  await app.startAllMicroservices()

  // Start application
  const port = envService.getEnvNumber('AUTH_PORT')
  await app.listen(port, () => logger.log(`🚀 Application is running: [Microservice: 'Auth', Port: ${port}]`))
}
bootstrap()

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught exception detected')
  throw err
})
