import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ClientsModule } from '@nestjs/microservices'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as Joi from 'joi'

import { AppConfigModule, JwtAuthGuard, RequestLoggerInterceptor } from '@app/common'
import { Message, MysqlModule } from '@app/database'
import {
  getAuthServiceOptions,
  getConversationsPackageOptions,
  getParticipantsPackageOptions
} from '@app/microservices'

import { MessagesController } from './messages.controller'
import { MessagesRepository } from './messages.repository'
import { MessagesService } from './messages.service'

@Module({
  imports: [
    AppConfigModule({
      MESSAGES_PORT: Joi.number().required(),
      AUTH_TCP_HOST: Joi.string().required(),
      AUTH_TCP_PORT: Joi.number().required(),
      CONVERSATIONS_GRPC_HOST: Joi.string().required(),
      CONVERSATIONS_GRPC_PORT: Joi.number().required(),
      PARTICIPANTS_GRPC_HOST: Joi.string().required(),
      PARTICIPANTS_GRPC_PORT: Joi.number().required()
    }),
    MysqlModule,
    TypeOrmModule.forFeature([Message]),
    ClientsModule.registerAsync([
      getAuthServiceOptions(),
      getConversationsPackageOptions(),
      getParticipantsPackageOptions()
    ])
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor
    },
    MessagesService,
    MessagesRepository
  ],
  exports: [MessagesService]
})
export class MessagesModule {}
