import { initializeTransactionalContext } from 'typeorm-transactional'
import { NestExpressApplication } from '@nestjs/platform-express'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { join } from 'path'

import { AppUtilsService, envService } from '@app/common'
import { PARTICIPANTS_PACKAGE, getGrpcConnectionOptions } from '@app/microservices'
import { ParticipantsModule } from './participants.module'

const loggerContext = 'ParticipantsMicroservice'
const logger = new Logger(loggerContext)

async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create<NestExpressApplication>(ParticipantsModule)
  const configService = app.get(ConfigService)

  // Connect `Participants` gRPC microservice
  const participantsGrpcHost = configService.get('PARTICIPANTS_GRPC_HOST')
  const participantsGrpcPort = configService.get('PARTICIPANTS_GRPC_PORT')
  app.connectMicroservice(
    getGrpcConnectionOptions(
      `${participantsGrpcHost}:${participantsGrpcPort}`,
      join(__dirname, '../participants.proto'),
      PARTICIPANTS_PACKAGE
    )
  )
  logger.log(`📦 Participants microservice successfully connected: [Transport: gRPC, Port: ${participantsGrpcPort}]`)

  // Setup application
  const appUtilsService = new AppUtilsService(loggerContext)
  appUtilsService.setupApp(app, { swaggerTitle: 'Participants' })

  // Start all Microservices
  await app.startAllMicroservices()

  // Start application
  const port = envService.getEnvNumber('PARTICIPANTS_PORT')
  await app.listen(port, () => logger.log(`🚀 Application is running: [Microservice: 'Participants', Port: ${port}]`))
}
bootstrap()

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught exception detected')
  throw err
})
