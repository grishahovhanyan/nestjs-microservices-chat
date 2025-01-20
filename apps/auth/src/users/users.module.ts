import { Module } from '@nestjs/common'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UsersRepository } from './users.repository'
import { UsersGrpcController } from './users.grpc.controller'

@Module({
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UsersModule {}
