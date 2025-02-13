import { IntersectionType } from '@nestjs/swagger'

import { OrderDto, PageTypes, PaginationDto, SearchDto } from '@app/common'

export class GetMessagesDto extends IntersectionType(PaginationDto(PageTypes.messages), SearchDto, OrderDto()) {
  conversationId: number
}
