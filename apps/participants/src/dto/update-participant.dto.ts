import { PickType } from '@nestjs/swagger'

import { CreateParticipantDto } from './create-participant.dto'

export class UpdateParticipantDto extends PickType(CreateParticipantDto, ['isAdmin', 'conversationId']) {}
