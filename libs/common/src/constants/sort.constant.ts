import { OrderObject } from '@app/database'

export enum SortDirections {
  ascending = 'ASC',
  descending = 'DESC'
}

export const DEFAULT_SORT_FIELDS = ['id']

export const USERS_SORT_FIELDS = ['id', 'fullName']

export function getSortOrderFromQuery(
  queryOrder: string[],
  allowedSortFields: string[] = DEFAULT_SORT_FIELDS
): OrderObject {
  const sortOrder = queryOrder.reduce((orderObject, sortField) => {
    let sortDirection = SortDirections.ascending
    if (sortField.startsWith('-')) {
      sortDirection = SortDirections.descending
      sortField = sortField.slice(1)
    }

    if (allowedSortFields.includes(sortField)) {
      orderObject[sortField] = sortDirection
    }
    return orderObject
  }, {})

  return sortOrder
}

export const getOrderDescription = (sortFields: string[] = DEFAULT_SORT_FIELDS) => `
    Allowed fields: ${sortFields.join(', ')}

    Examples: 
      ?order=-id (descending) 
      ?order=createdAt (ascending) 
      ?order=id,-createdAt`
