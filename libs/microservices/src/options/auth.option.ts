import { ConfigService } from '@nestjs/config'
import { ClientsProviderAsyncOptions } from '@nestjs/microservices'

import { AUTH_SERVICE } from '../constants'
import { getTcpConnectionOptions } from './helper'

export function getAuthServiceOptions(): ClientsProviderAsyncOptions {
  return {
    name: AUTH_SERVICE,
    useFactory: (configService: ConfigService) =>
      getTcpConnectionOptions(configService.get('AUTH_TCP_HOST'), configService.get('AUTH_TCP_PORT')),
    inject: [ConfigService]
  }
}
