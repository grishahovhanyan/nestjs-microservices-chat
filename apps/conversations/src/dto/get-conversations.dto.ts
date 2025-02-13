import { IntersectionType } from '@nestjs/swagger'

import { OrderDto, PageTypes, PaginationDto, SearchDto } from '@app/common'
import { BooleanFieldOptional } from '@app/common/validators'

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
