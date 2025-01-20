import { IntersectionType } from '@nestjs/swagger'
import { PaginationDto, SearchDto, OrderDto, PageTypes } from '@app/common'
import { BooleanFieldOptional, NumberIdsField, StringField, StringFieldOptional } from '@app/common/validators'

export class GetConversationsDto extends IntersectionType(
  PaginationDto(PageTypes.conversations),
  SearchDto,
  OrderDto()
) {
  @BooleanFieldOptional()
  groupOnly?: boolean

  @BooleanFieldOptional()
  p2pOnly?: boolean

  userId: number
}

export class CreateConversationDto {
  @StringField({ example: 'Conversation Name' })
  name: string

  @NumberIdsField()
  userIds: number[]

  creatorId: number
}

export class UpdateConversationDto {
  @StringFieldOptional({ example: 'Conversation Name' })
  name?: string
}
