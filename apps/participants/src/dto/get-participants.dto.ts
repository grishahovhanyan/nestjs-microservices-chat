import { IntersectionType } from '@nestjs/swagger'

import { OrderDto, PageTypes, PaginationDto, SearchDto } from '@app/common'

export class GetParticipantsDto extends IntersectionType(PaginationDto(PageTypes.participants), SearchDto, OrderDto()) {
  userId: number
  conversationId: number
}
