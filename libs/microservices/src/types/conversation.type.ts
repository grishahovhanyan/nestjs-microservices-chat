/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { GrpcMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'

import { Conversation } from '@app/database'

export interface FindOneConversationDto {
  conversationId: number
  userId: number
}

export interface ConversationsGrpcServiceClient {
  findOneConversation(request: FindOneConversationDto): Observable<Conversation>
}

export const CONVERSATIONS_SERVICE_NAME = 'ConversationsService'

export function ConversationsGrpcServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['findOneConversation']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod(CONVERSATIONS_SERVICE_NAME, method)(constructor.prototype[method], method, descriptor)
    }
  }
}
