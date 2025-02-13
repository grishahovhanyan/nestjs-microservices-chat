import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'

import { envService, UserStatuses } from '@app/common'

import { UsersService } from '../users/users.service'

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  transports: ['websocket', 'polling'],
  cors: {
    origin: envService.getOrigins(),
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 5000,
  pingInterval: 10000
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(ChatGateway.name)

  @WebSocketServer()
  server: Server

  constructor(private readonly usersService: UsersService) {}

  async handleConnection(client: Socket) {
    const payload: JwtPayload = this.handshakeAndVerifyAuthToken(client)

    if (!payload?.userId) {
      return
    }

    /*
    ####### NOTE #######
    For each user, we will create a separate room. All sockets of that user will join the same room.
    */
    const room = this.getRoomName(payload.userId)
    try {
      await client.join(room)
      this.logger.log(`User joined to room: ${room}`)
    } catch (error) {
      this.logger.error('Error joining room:', error)
    }

    const roomSockets = await this.getSocketIdsInRoom(room)

    if (roomSockets.length === 1) {
      this.logger.log(`User online: ${payload.userId}`)
      await this.usersService.updateById(payload.userId, { status: UserStatuses.online })
    }
  }

  async handleDisconnect(client: Socket) {
    const payload: JwtPayload = this.handshakeAndVerifyAuthToken(client)

    if (!payload?.userId) {
      return
    }

    const room = this.getRoomName(payload.userId)
    const roomSockets = await this.getSocketIdsInRoom(room)

    if (roomSockets.length === 0) {
      this.logger.log(`User offline: ${payload.userId}`)
      await this.usersService.updateById(payload.userId, { status: UserStatuses.offline, offlineAt: new Date() })
    }
  }

  private handshakeAndVerifyAuthToken(client: Socket): JwtPayload {
    const authToken = client.handshake.auth?.token

    if (!authToken || !authToken.startsWith('Bearer ')) {
      client.disconnect()
      this.logger.log('Connection refused: Invalid or missing token')
      return
    }

    const token = authToken.split(' ')[1]
    let payload: string | JwtPayload

    try {
      payload = jwt.verify(token, envService.getEnvString('JWT_SECRET'))
    } catch (error) {
      this.logger.error('Error verifying token:', error)
      return
    }

    if (!payload || typeof payload === 'string' || !payload?.userId) {
      return
    }

    return payload
  }

  /*
  ####### NOTE #######
  The `userType` parameter allows specifying different user types (e.g., admin, user).
  The default userType is 'user'. The room name is created in the format `${userType}-${userId}`.
  */
  private getRoomName(userId: number, userType: string = 'user') {
    if (!userId || !userType) {
      throw new ConflictException()
    }
    return `${userType}-${userId}`
  }

  private async getSocketIdsInRoom(room: string): Promise<string[]> {
    const sockets = await this.server.in(room).fetchSockets()
    return sockets.map((socket) => socket.id)
  }

  /*
  ####### NOTE #######
  Emits an event to the specified users in their respective rooms.
    - `users`: Array of user objects ({ userId, type? }).
    - `event`: Name of the event to emit.
    - `data`: Payload to send with the event.
  */
  emitToUsers(users: { userId: number; type?: string }[], event: string, data: any) {
    for (const user of users) {
      this.server.compress(true).to(this.getRoomName(user.userId, user.type)).emit(event, data)
    }
  }
}
