import { IntersectionType } from '@nestjs/swagger'

import { OrderDto, PageTypes, PaginationDto, SearchDto, USERS_SORT_FIELDS } from '@app/common'

export class GetUsersDto extends IntersectionType(
  PaginationDto(PageTypes.users),
  SearchDto,
  OrderDto(USERS_SORT_FIELDS)
) {
  userIdsToExclude?: number[]
  userIdsToInclude?: number[]
}
