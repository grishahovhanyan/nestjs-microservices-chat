import { StringField } from '@app/common/validators'

export class CreateMessageDto {
  @StringField({ example: 'Message body' })
  body: string

  participantId: number
  conversationId: number
}
