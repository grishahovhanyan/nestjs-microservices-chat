/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Observable } from 'rxjs'
import { GrpcMethod } from '@nestjs/microservices'
import { User } from '@app/database'

export interface FindOneUserDto {
  userId: number
}

export interface FindUsersByIdsDto {
  userIds: number[]
}

export interface UsersGrpcServiceClient {
  findOneUser(request: FindOneUserDto): Observable<User>
  findUsersByIds(request: FindUsersByIdsDto): Observable<{ results: User[] }>
}

export const USERS_SERVICE_NAME = 'UsersService'

export function UsersGrpcServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['findOneUser', 'findUsersByIds']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod(USERS_SERVICE_NAME, method)(constructor.prototype[method], method, descriptor)
    }
  }
}
