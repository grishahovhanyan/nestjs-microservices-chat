import { UserStatuses } from '@app/common'

export class UpdateUserDto {
  fullName?: string
  status?: UserStatuses
  offlineAt?: Date
}
