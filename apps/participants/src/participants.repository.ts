import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { BaseRepository, Participant } from '@app/database'

@Injectable()
export class ParticipantsRepository extends BaseRepository<Participant> {
  constructor(dataSource: DataSource) {
    super(dataSource, Participant)
  }
}
