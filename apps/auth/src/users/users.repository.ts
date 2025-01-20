import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { BaseRepository, User } from '@app/database'

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(dataSource, User)
  }
}
