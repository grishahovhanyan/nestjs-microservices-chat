import { Injectable } from '@nestjs/common'
import { DataSource, DeepPartial, FindOptionsWhere, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { FindAndCountInput, FindAndCountOutput, FindInput } from '@app/database'

@Injectable()
export class BaseRepository<T> {
  constructor(
    private dataSource: DataSource,
    private entity: new () => T
  ) {}

  protected getRepository(): Repository<T> {
    return this.dataSource.manager.getRepository(this.entity)
  }

  async findAndCount(input: FindAndCountInput<T>): Promise<FindAndCountOutput<T>> {
    const { conditions, relations = [], take, skip, order } = input

    const [items, totalCount] = await this.getRepository().findAndCount({
      where: conditions,
      relations,
      take,
      skip,
      order
    })

    return { items, totalCount }
  }

  async create(createInput: DeepPartial<T>): Promise<T> {
    const user = this.getRepository().create(createInput)
    await this.getRepository().save(user)

    return user
  }

  async bulkCreate(bulkCreateInput: DeepPartial<T>[]) {
    return await this.getRepository().save(this.getRepository().create(bulkCreateInput))
  }

  async findOne(conditions: FindOptionsWhere<T>, findInput?: FindInput): Promise<T> {
    return await this.getRepository().findOne({
      where: conditions,
      relations: findInput?.relations || []
    })
  }

  async find(conditions: FindOptionsWhere<T>, findInput?: FindInput): Promise<T[]> {
    return await this.getRepository().find({
      where: conditions,
      relations: findInput?.relations || []
    })
  }

  async update(conditions: FindOptionsWhere<T>, updateInput: QueryDeepPartialEntity<T>) {
    return await this.getRepository().update(conditions, updateInput)
  }

  async delete(conditions: FindOptionsWhere<T>) {
    return await this.getRepository().delete(conditions)
  }
}
