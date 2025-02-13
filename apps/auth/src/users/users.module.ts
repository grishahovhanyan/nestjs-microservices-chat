import { Module } from '@nestjs/common'

import { UsersController } from './users.controller'
import { UsersGrpcController } from './users.grpc.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController, UsersGrpcController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UsersModule {}
