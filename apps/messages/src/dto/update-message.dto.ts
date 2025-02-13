import { PickType } from '@nestjs/swagger'

import { StringFieldOptional } from '@app/common/validators'

import { CreateMessageDto } from './create-message.dto'

export class UpdateMessageDto extends PickType(CreateMessageDto, ['participantId', 'conversationId']) {
  @StringFieldOptional({ example: 'Message body' })
  body?: string
}
