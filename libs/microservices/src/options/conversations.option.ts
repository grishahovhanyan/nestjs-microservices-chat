import { ConfigService } from '@nestjs/config'
import { ClientsProviderAsyncOptions } from '@nestjs/microservices'
import { join } from 'path'

import { CONVERSATIONS_PACKAGE } from '../constants'
import { getGrpcConnectionOptions } from './helper'

export function getConversationsPackageOptions(): ClientsProviderAsyncOptions {
  return {
    name: CONVERSATIONS_PACKAGE,
    useFactory: (configService: ConfigService) =>
      getGrpcConnectionOptions(
        `${configService.get('CONVERSATIONS_GRPC_HOST')}:${configService.get('CONVERSATIONS_GRPC_PORT')}`,
        join(__dirname, '../conversations.proto'),
        CONVERSATIONS_PACKAGE
      ),
    inject: [ConfigService]
  }
}
