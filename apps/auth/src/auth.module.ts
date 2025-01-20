import { APP_INTERCEPTOR } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import * as Joi from 'joi'
import { AppConfigModule, RequestLoggerInterceptor } from '@app/common'
import { MysqlModule, User } from '@app/database'

import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtConfigService } from './jwt-config.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UsersModule } from './users/users.module'
import { SocketModule } from './socket/socket.module'

@Module({
  imports: [
    AppConfigModule({
      AUTH_PORT: Joi.number().required(),
      AUTH_TCP_HOST: Joi.string().required(),
      AUTH_TCP_PORT: Joi.number().required(),
      USERS_GRPC_HOST: Joi.string().required(),
      USERS_GRPC_PORT: Joi.number().required(),
      JWT_SECRET: Joi.string().required(),
      JWT_EXPIRATION: Joi.string().required()
    }),
    MysqlModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({ useClass: JwtConfigService }),
    SocketModule,
    UsersModule
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor
    },
    AuthService,
    JwtStrategy
  ]
})
export class AuthModule {}
