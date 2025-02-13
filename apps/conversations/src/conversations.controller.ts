import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'

import { Swagger } from '@app/swagger'
import { EnhancedController, RequestUser, TransformResponse } from '@app/common'
import { Conversation } from '@app/database'

import { ConversationsService } from './conversations.service'
import { CreateConversationDto, GetConversationsDto, UpdateConversationDto } from './dto'

@EnhancedController('conversations')
@TransformResponse(Conversation)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Swagger({ pagination: true })
  @Get()
  index(@RequestUser('id') currentUserId: number, @Query() query: GetConversationsDto) {
    return this.conversationsService.index(currentUserId, query)
  }

  @Swagger({ errorResponses: [404] })
  @Post()
  create(@RequestUser('id') currentUserId: number, @Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(currentUserId, createConversationDto)
  }

  @Swagger({ errorResponses: [404] })
  @Get(':id')
  find(@RequestUser('id') currentUserId: number, @Param('id') conversationId: number) {
    return this.conversationsService.find(currentUserId, conversationId)
  }

  @Swagger({ errorResponses: [404] })
  @Put(':id')
  update(
    @RequestUser('id') currentUserId: number,
    @Param('id') conversationId: number,
    @Body() updateConversationDto: UpdateConversationDto
  ) {
    return this.conversationsService.update(currentUserId, conversationId, updateConversationDto)
  }

  @Swagger({ errorResponses: [403, 404] })
  @Delete(':id')
  delete(@RequestUser('id') currentUserId: number, @Param('id') conversationId: number) {
    return this.conversationsService.delete(currentUserId, conversationId)
  }
}
