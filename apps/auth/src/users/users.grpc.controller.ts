import { Controller } from '@nestjs/common'
import { UsersGrpcServiceControllerMethods, FindOneUserDto, FindUsersByIdsDto } from '@app/microservices'
import { UsersService } from './users.service'

/*
####### NOTE #######
The `UsersGrpcServiceControllerMethods` decorator automatically applies the `GrpcMethod` decorator to all methods in this class.
*/

@Controller()
@UsersGrpcServiceControllerMethods()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  async findOneUser(findOneUserDto: FindOneUserDto) {
    return (await this.usersService.getById(findOneUserDto.userId)) ?? {}
  }

  async findUsersByIds(findUsersByIdsDto: FindUsersByIdsDto) {
    const users = await this.usersService.getByIds(findUsersByIdsDto.userIds)
    return { results: users }
  }
}
