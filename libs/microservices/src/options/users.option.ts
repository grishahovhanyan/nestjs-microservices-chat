import { ConfigService } from '@nestjs/config'
import { ClientsProviderAsyncOptions } from '@nestjs/microservices'
import { join } from 'path'

import { USERS_PACKAGE } from '../constants'
import { getGrpcConnectionOptions } from './helper'

export function getUsersPackageOptions(): ClientsProviderAsyncOptions {
  return {
    name: USERS_PACKAGE,
    useFactory: (configService: ConfigService) => {
      const url = `${configService.get('USERS_GRPC_HOST')}:${configService.get('USERS_GRPC_PORT')}`
      const protoPath = join(__dirname, '../users.proto')
      return getGrpcConnectionOptions(url, protoPath, USERS_PACKAGE)
    },
    inject: [ConfigService]
  }
}
