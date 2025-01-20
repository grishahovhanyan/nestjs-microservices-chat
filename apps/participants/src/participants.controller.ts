import { Get, Post, Query, Body, Param, Put, Delete } from '@nestjs/common'
import { Swagger } from '@app/swagger'

import { EnhancedController, RequestUser, TransformResponse } from '@app/common'

import { CreateParticipantDto, GetParticipantsDto, UpdateParticipantDto } from './dto/participant.dto'
import { Participant } from '@app/database'
import { ParticipantsService } from './participants.service'

@EnhancedController('conversations/:conversationId/participants', true, 'Participants')
@TransformResponse(Participant)
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Swagger({ pagination: true, errorResponses: [404] })
  @Get()
  index(
    @RequestUser('id') currentUserId: number,
    @Param('conversationId') conversationId: number,
    @Query() query: GetParticipantsDto
  ) {
    return this.participantsService.index(currentUserId, conversationId, query)
  }

  @Swagger({ 201: true, errorResponses: [400, 403, 404] })
  @Post()
  create(
    @RequestUser('id') currentUserId: number,
    @Param('conversationId') conversationId: number,
    @Body() createParticipantDto: CreateParticipantDto
  ) {
    return this.participantsService.create(currentUserId, conversationId, createParticipantDto)
  }

  @Swagger({ errorResponses: [404] })
  @Get(':id')
  find(
    @RequestUser('id') currentUserId: number,
    @Param('conversationId') conversationId: number,
    @Param('id') participantId: number
  ) {
    return this.participantsService.find(currentUserId, conversationId, participantId)
  }

  @Swagger({ errorResponses: [400, 403, 404] })
  @Put(':id')
  update(
    @RequestUser('id') currentUserId: number,
    @Param('conversationId') conversationId: number,
    @Param('id') participantId: number,
    @Body() updateParticipantDto: UpdateParticipantDto
  ) {
    return this.participantsService.update(currentUserId, conversationId, participantId, updateParticipantDto)
  }

  @Swagger({ errorResponses: [403, 404] })
  @Delete(':id')
  delete(
    @RequestUser('id') currentUserId: number,
    @Param('conversationId') conversationId: number,
    @Param('id') participantId: number
  ) {
    return this.participantsService.delete(currentUserId, conversationId, participantId)
  }
}
