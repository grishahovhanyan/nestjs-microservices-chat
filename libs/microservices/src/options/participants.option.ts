import { ConfigService } from '@nestjs/config'
import { ClientsProviderAsyncOptions } from '@nestjs/microservices'
import { join } from 'path'

import { PARTICIPANTS_PACKAGE } from '../constants'
import { getGrpcConnectionOptions } from './helper'

export function getParticipantsPackageOptions(): ClientsProviderAsyncOptions {
  return {
    name: PARTICIPANTS_PACKAGE,
    useFactory: (configService: ConfigService) =>
      getGrpcConnectionOptions(
        `${configService.get('PARTICIPANTS_GRPC_HOST')}:${configService.get('PARTICIPANTS_GRPC_PORT')}`,
        join(__dirname, '../participants.proto'),
        PARTICIPANTS_PACKAGE
      ),
    inject: [ConfigService]
  }
}
