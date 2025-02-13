import { StringFieldOptional } from '@app/common/validators'

export class UpdateConversationDto {
  @StringFieldOptional({ example: 'Conversation Name' })
  name?: string
}
