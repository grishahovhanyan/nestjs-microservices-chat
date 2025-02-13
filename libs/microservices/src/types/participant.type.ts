/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { GrpcMethod } from '@nestjs/microservices'
import { Observable } from 'rxjs'

import { Participant } from '@app/database'

export interface FindParticipantsDto {
  conversationId: number
}

export interface FindOneParticipantDto {
  userId: number
  conversationId: number
}

export interface CreateParticipantDto {
  userId: number
  conversationId: number
}

export interface ParticipantsGrpcServiceClient {
  findParticipantsByConvId(request: FindParticipantsDto): Observable<{ results: Participant[] }>
  findOneParticipant(request: FindOneParticipantDto): Observable<Participant>
  createParticipants(request: {
    createParticipantsInput: CreateParticipantDto[]
  }): Observable<{ results: Participant[] }>
}

export const PARTICIPANTS_SERVICE_NAME = 'ParticipantsService'

export function ParticipantsGrpcServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['findParticipantsByConvId', 'findOneParticipant', 'createParticipants']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod(PARTICIPANTS_SERVICE_NAME, method)(constructor.prototype[method], method, descriptor)
    }
  }
}
