import { Get, Post, Query, Body, Param, Put, Delete, UseGuards } from '@nestjs/common'
import { Swagger } from '@app/swagger'

import { EnhancedController, RequestUser, TransformResponse } from '@app/common'
import { ConversationAccessGuard } from './guards/conversation-access.guard'
import { GetMessagesDto, CreateMessageDto, UpdateMessageDto } from './dto/message.dto'

import { Message } from '@app/database'
import { MessagesService } from './messages.service'

@EnhancedController('conversations/:conversationId/messages', true, 'Messages')
@UseGuards(ConversationAccessGuard)
@TransformResponse(Message)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Swagger({ errorResponses: [404] })
  @Get()
  index(@Param('conversationId') conversationId: number, @Query() query: GetMessagesDto) {
    return this.messagesService.index(conversationId, query)
  }

  @Swagger({ errorResponses: [400, 404] })
  @Post()
  create(
    @RequestUser('id') currentUserId: number,
    @Param('conversationId') conversationId: number,
    @Body() createMessageDto: CreateMessageDto
  ) {
    return this.messagesService.create(currentUserId, conversationId, createMessageDto)
  }

  @Swagger({
    params: [{ name: 'conversationId', type: Number }],
    errorResponses: [400, 404]
  })
  @Get(':id')
  find(@Param('id') messageId: number) {
    return this.messagesService.find(messageId)
  }

  @Swagger({
    params: [{ name: 'conversationId', type: Number }],
    errorResponses: [400, 403, 404]
  })
  @Put(':id')
  update(
    @RequestUser('id') currentUserId: number,
    @Param('id') messageId: number,
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    return this.messagesService.update(currentUserId, messageId, updateMessageDto)
  }

  @Swagger({
    params: [{ name: 'conversationId', type: Number }],
    errorResponses: [403, 404]
  })
  @Delete(':id')
  delete(@RequestUser('id') currentUserId: number, @Param('id') messageId: number) {
    return this.messagesService.delete(currentUserId, messageId)
  }
}
