import { BooleanFieldOptional, NumberField } from '@app/common/validators'

export class CreateParticipantDto {
  @NumberField({ example: 3 })
  userId: number

  @BooleanFieldOptional({ example: false })
  isAdmin?: boolean

  conversationId: number
}
