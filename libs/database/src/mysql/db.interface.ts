import { FindOptionsOrder, FindOptionsWhere } from 'typeorm'

import { SortDirections } from '@app/common'

export type OrderObject = Record<string, SortDirections>

export interface GetAndCountInput {
  page: number
  perPage: number
  order: OrderObject
}

export interface FindAndCountInput<T> {
  conditions: FindOptionsWhere<T>
  relations?: string[]
  take: number
  skip: number
  order?: FindOptionsOrder<T>
}

export interface FindAndCountOutput<T> {
  items: T[]
  totalCount: number
}

export interface FindInput {
  relations?: string[]
}
