import {
  CreateParticipantDto,
  FindOneParticipantDto,
  FindParticipantsDto,
  ParticipantsGrpcServiceControllerMethods
} from '@app/microservices'
import { Controller } from '@nestjs/common'

import { ParticipantsService } from './participants.service'

/*
####### NOTE #######
The `ParticipantsGrpcServiceControllerMethods` decorator automatically applies the `GrpcMethod` decorator to all methods in this class.
*/

@Controller()
@ParticipantsGrpcServiceControllerMethods()
export class ParticipantsGrpcController {
  constructor(private readonly participantsService: ParticipantsService) {}

  async findParticipantsByConvId(findParticipantsDto: FindParticipantsDto) {
    return {
      results: await this.participantsService.getByConvId(findParticipantsDto.conversationId)
    }
  }

  async findOneParticipant(findOneParticipantDto: FindOneParticipantDto) {
    const { userId, conversationId } = findOneParticipantDto
    return (await this.participantsService.getByConvIdAndUserId(conversationId, userId)) ?? {}
  }

  async createParticipants(createParticipantsDto: { createParticipantsInput: CreateParticipantDto[] }) {
    const { createParticipantsInput } = createParticipantsDto
    return {
      results: await this.participantsService.bulkCreate(createParticipantsInput)
    }
  }
}
