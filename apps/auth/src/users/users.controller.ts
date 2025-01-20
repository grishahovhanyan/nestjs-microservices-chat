import { Get, Query, UseGuards } from '@nestjs/common'
import { EnhancedController, RequestUser, TransformResponse, paginatedResponse } from '@app/common'

import { Swagger } from '@app/swagger'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { GetUsersDto } from './dto/user.dto'

import { User } from '@app/database'
import { UsersService } from './users.service'

@EnhancedController('users')
@UseGuards(JwtAuthGuard)
@TransformResponse(User)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Swagger()
  @Get('me')
  async getMe(@RequestUser('id') currentUserId: number) {
    return await this.usersService.getById(currentUserId)
  }

  @Swagger({ pagination: true })
  @Get()
  async index(@RequestUser('id') currentUserId: number, @Query() query: GetUsersDto) {
    const { items, totalCount } = await this.usersService.getAndCount({
      ...query,
      userIdsToExclude: [currentUserId]
    })

    return paginatedResponse(items, totalCount, query.page, query.perPage)
  }
}
