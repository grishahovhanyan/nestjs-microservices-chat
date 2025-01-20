import { IntersectionType, PickType } from '@nestjs/swagger'
import { PaginationDto, SearchDto, OrderDto, PageTypes } from '@app/common'
import { StringField, StringFieldOptional } from '@app/common/validators'

export class GetMessagesDto extends IntersectionType(PaginationDto(PageTypes.messages), SearchDto, OrderDto()) {
  conversationId: number
}

export class CreateMessageDto {
  @StringField({ example: 'Message body' })
  body: string

  participantId: number
  conversationId: number
}

export class UpdateMessageDto extends PickType(CreateMessageDto, ['participantId', 'conversationId']) {
  @StringFieldOptional({ example: 'Message body' })
  body?: string
}
