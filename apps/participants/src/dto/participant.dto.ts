import { IntersectionType, PickType } from '@nestjs/swagger'
import { PaginationDto, SearchDto, OrderDto, PageTypes } from '@app/common'
import { BooleanFieldOptional, NumberField } from '@app/common/validators'

export class GetParticipantsDto extends IntersectionType(PaginationDto(PageTypes.participants), SearchDto, OrderDto()) {
  userId: number
  conversationId: number
}

export class CreateParticipantDto {
  @NumberField({ example: 3 })
  userId: number

  @BooleanFieldOptional({ example: false })
  isAdmin?: boolean

  conversationId: number
}

export class UpdateParticipantDto extends PickType(CreateParticipantDto, ['isAdmin', 'conversationId']) {}
