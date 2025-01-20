import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ClientsModule } from '@nestjs/microservices'
import * as Joi from 'joi'

import { AppConfigModule, JwtAuthGuard, RequestLoggerInterceptor } from '@app/common'
import { getAuthServiceOptions, getUsersPackageOptions } from '@app/microservices'
import { MysqlModule, Participant } from '@app/database'

import { ParticipantsController } from './participants.controller'
import { ParticipantsGrpcController } from './participants.grpc.controller'
import { ParticipantsService } from './participants.service'
import { ParticipantsRepository } from './participants.repository'

@Module({
  imports: [
    AppConfigModule({
      PARTICIPANTS_PORT: Joi.number().required(),
      PARTICIPANTS_GRPC_HOST: Joi.string().required(),
      PARTICIPANTS_GRPC_PORT: Joi.number().required(),
      AUTH_TCP_HOST: Joi.string().required(),
      AUTH_TCP_PORT: Joi.number().required()
    }),
    MysqlModule,
    TypeOrmModule.forFeature([Participant]),
    ClientsModule.registerAsync([getAuthServiceOptions(), getUsersPackageOptions()])
  ],
  controllers: [ParticipantsController, ParticipantsGrpcController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor
    },
    ParticipantsService,
    ParticipantsRepository
  ],
  exports: [ParticipantsService]
})
export class ParticipantsModule {}
