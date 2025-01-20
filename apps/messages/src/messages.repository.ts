import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { BaseRepository, Message } from '@app/database'

@Injectable()
export class MessagesRepository extends BaseRepository<Message> {
  constructor(dataSource: DataSource) {
    super(dataSource, Message)
  }
}
