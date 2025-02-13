import { getSortOrderFromQuery } from '@app/common'
import { OrderObject } from '@app/database'

import { envService } from './get-env'

export enum PageTypes {
  users = 'users',
  conversations = 'conversations',
  participants = 'participants',
  messages = 'messages'
}

export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 200

export const DEFAULT_PAGE_SIZES = {
  [PageTypes.users]: envService.getEnvNumber('USERS_PAGE_SIZE', DEFAULT_PAGE_SIZE),
  [PageTypes.conversations]: envService.getEnvNumber('CONVERSATIONS_PAGE_SIZE', DEFAULT_PAGE_SIZE),
  [PageTypes.participants]: envService.getEnvNumber('PARTICIPANTS_PAGE_SIZE', DEFAULT_PAGE_SIZE),
  [PageTypes.messages]: envService.getEnvNumber('MESSAGES_PAGE_SIZE', DEFAULT_PAGE_SIZE)
}

export const MAX_PAGE_SIZES = {
  [PageTypes.users]: envService.getEnvNumber('USERS_MAX_PAGE_SIZE', MAX_PAGE_SIZE),
  [PageTypes.conversations]: envService.getEnvNumber('CONVERSATIONS_MAX_PAGE_SIZE', MAX_PAGE_SIZE),
  [PageTypes.participants]: envService.getEnvNumber('PARTICIPANTS_MAX_PAGE_SIZE', MAX_PAGE_SIZE),
  [PageTypes.messages]: envService.getEnvNumber('MESSAGES_MAX_PAGE_SIZE', MAX_PAGE_SIZE)
}

export function getPerPage(type: string, querySize?: number) {
  const defaultSize = DEFAULT_PAGE_SIZES[type] ?? DEFAULT_PAGE_SIZE
  const maxSize = MAX_PAGE_SIZES[type] ?? MAX_PAGE_SIZE

  return +querySize && +querySize <= maxSize ? +querySize : defaultSize
}

export function getPagesForResponse(totalCount: number, page: number, perPage: number) {
  const numPages = Math.ceil(totalCount / perPage)

  return {
    next: page + 1 > numPages ? null : page + 1,
    previous: page - 1 < 1 ? null : page - 1,
    current: page,
    numPages,
    perPage
  }
}

export function getPaginationAndSortOrder(
  query: { page?: number; perPage?: number; order?: string },
  pageSizeType: string,
  allowedSortFields?: string[]
): { page: number; perPage: number; order: OrderObject } {
  const page = +query.page || 1
  const perPage = getPerPage(pageSizeType, +query.perPage)
  const order = getSortOrderFromQuery(query.order?.split(',') ?? [], allowedSortFields)

  return { page, perPage, order }
}

export function paginatedResponse<T>(items: T[], totalCount: number, page: number, perPage: number) {
  return {
    pages: getPagesForResponse(totalCount, page, perPage),
    count: items.length,
    items
  }
}
