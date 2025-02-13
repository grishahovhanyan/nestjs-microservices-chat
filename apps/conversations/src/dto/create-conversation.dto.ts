import { NumberIdsField, StringField } from '@app/common/validators'

export class CreateConversationDto {
  @StringField({ example: 'Conversation Name' })
  name: string

  @NumberIdsField()
  userIds: number[]

  creatorId: number
}
