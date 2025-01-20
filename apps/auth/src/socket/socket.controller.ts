import { MessagePattern, Payload } from '@nestjs/microservices'
import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import { join } from 'path'

import { EMIT_SOCKET_EVENT_MSG_PATTERN } from '@app/common'
import { SocketService } from './socket.service'
import { EmitSocketEventPayload } from './payloads/emit-socket-event.payload'

@Controller('')
export class SocketController {
  constructor(private readonly socketService: SocketService) {}

  @MessagePattern(EMIT_SOCKET_EVENT_MSG_PATTERN)
  emitSocketEvent(@Payload() payload: EmitSocketEventPayload) {
    return this.socketService.emitSocketEvent(payload)
  }

  @Get('/chat-ui')
  renderChatUi(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'html', 'index.html'))
  }
}
