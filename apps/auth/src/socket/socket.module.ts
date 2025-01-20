import { Module } from '@nestjs/common'

import { UsersModule } from '../users/users.module'
import { ChatGateway } from './chat.gateway'
import { SocketController } from './socket.controller'
import { SocketService } from './socket.service'

@Module({
  imports: [UsersModule],
  controllers: [SocketController],
  providers: [ChatGateway, SocketService]
})
export class SocketModule {}
