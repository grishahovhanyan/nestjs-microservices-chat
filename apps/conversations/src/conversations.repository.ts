import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { BaseRepository, Conversation } from '@app/database'

@Injectable()
export class ConversationsRepository extends BaseRepository<Conversation> {
  constructor(dataSource: DataSource) {
    super(dataSource, Conversation)
  }
}
