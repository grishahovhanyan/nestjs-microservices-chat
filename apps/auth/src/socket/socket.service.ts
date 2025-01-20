import { Injectable } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'
import { EmitSocketEventPayload } from './payloads/emit-socket-event.payload'

@Injectable()
export class SocketService {
  constructor(private readonly chatGateway: ChatGateway) {}

  emitSocketEvent(payload: EmitSocketEventPayload): boolean {
    try {
      this.chatGateway.emitToUsers(
        payload.userIds.map((userId) => ({ userId })),
        payload.event,
        payload.data
      )
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
