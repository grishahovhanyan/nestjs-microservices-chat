import {
  AUTH_SERVICE,
  CONVERSATIONS_PACKAGE,
  CONVERSATIONS_SERVICE_NAME,
  ConversationsGrpcServiceClient,
  PARTICIPANTS_PACKAGE,
  PARTICIPANTS_SERVICE_NAME,
  ParticipantsGrpcServiceClient
} from '@app/microservices'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ClientGrpc, ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { FindOptionsWhere, Like } from 'typeorm'

import {
  ChatSocketEvents,
  EMIT_SOCKET_EVENT_MSG_PATTERN,
  ForbiddenException,
  NotFoundException,
  paginatedResponse,
  SUCCESS_RESPONSE
} from '@app/common'
import { FindAndCountInput, Message, Participant } from '@app/database'

import { CreateMessageDto, GetMessagesDto, UpdateMessageDto } from './dto'
import { MessagesRepository } from './messages.repository'

@Injectable()
export class MessagesService implements OnModuleInit {
  private conversationsService: ConversationsGrpcServiceClient
  private participantsService: ParticipantsGrpcServiceClient

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
    @Inject(CONVERSATIONS_PACKAGE) private readonly conversationsPackageClint: ClientGrpc,
    @Inject(PARTICIPANTS_PACKAGE) private readonly participantsPackageClint: ClientGrpc,
    private readonly messagesRepository: MessagesRepository
  ) {}

  onModuleInit() {
    this.conversationsService =
      this.conversationsPackageClint.getService<ConversationsGrpcServiceClient>(CONVERSATIONS_SERVICE_NAME)
    this.participantsService =
      this.participantsPackageClint.getService<ParticipantsGrpcServiceClient>(PARTICIPANTS_SERVICE_NAME)
  }

  // ******* Controller Handlers *******
  async index(conversationId: number, query: GetMessagesDto) {
    const { items, totalCount } = await this.getAndCount({
      ...query,
      conversationId
    })

    return paginatedResponse(items, totalCount, query.page, query.perPage)
  }

  async create(currentUserId: number, conversationId: number, createMessageDto: CreateMessageDto) {
    const participant = await this.getParticipant(conversationId, currentUserId)

    if (!participant?.id) {
      throw new NotFoundException()
    }

    const message = await this.createMsg({
      ...createMessageDto,
      participantId: participant.id,
      conversationId
    })

    const participants = await this.getParticipantsByConvId(conversationId)

    await this.emitSocketEvent(
      participants.map(({ userId }) => userId),
      ChatSocketEvents.messageCreated,
      { userId: currentUserId, message }
    )

    return message
  }

  async find(messageId: number) {
    const message = await this.getById(messageId)

    if (!message) {
      throw new NotFoundException()
    }

    return message
  }

  async update(currentUserId: number, messageId: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.getById(messageId)

    if (!message) {
      throw new NotFoundException()
    }

    if (message.participant.userId !== currentUserId) {
      throw new ForbiddenException()
    }

    if (!Object.keys(updateMessageDto)?.length) {
      return message
    }

    const updatedMessage = await this.updateById(messageId, updateMessageDto)

    const participants = await this.getParticipantsByMsgId(messageId)

    await this.emitSocketEvent(
      participants.map(({ userId }) => userId),
      ChatSocketEvents.messageUpdated,
      {
        userId: currentUserId,
        message: updatedMessage
      }
    )

    return updatedMessage
  }

  async delete(currentUserId: number, messageId: number) {
    const message = await this.getById(messageId)

    if (!message) {
      throw new NotFoundException()
    }

    if (message.participant.userId !== currentUserId) {
      throw new ForbiddenException()
    }

    await this.deleteById(messageId)

    const participants = await this.getParticipantsByMsgId(messageId)

    await this.emitSocketEvent(
      participants.map(({ userId }) => userId),
      ChatSocketEvents.messageDeleted,
      { userId: currentUserId, message }
    )

    return SUCCESS_RESPONSE
  }

  // ******* ******* ******* *******

  async emitSocketEvent(userIds: number[], event: string, data: any) {
    return firstValueFrom(this.authService.send(EMIT_SOCKET_EVENT_MSG_PATTERN, { userIds, event, data }))
  }

  async getConversation(conversationId: number, userId: number) {
    return firstValueFrom(this.conversationsService.findOneConversation({ conversationId, userId }))
  }

  async checkConversationAccess(conversationId: number, userId: number): Promise<boolean> {
    const conversation = await this.getConversation(conversationId, userId)

    if (!conversation?.id) {
      throw new NotFoundException()
    }

    return true
  }

  async getParticipantsByConvId(conversationId: number): Promise<Participant[]> {
    const { results: participants } = await firstValueFrom(
      this.participantsService.findParticipantsByConvId({ conversationId })
    )

    return participants
  }

  async getParticipant(conversationId: number, userId: number): Promise<Participant | null> {
    const participant = await firstValueFrom(this.participantsService.findOneParticipant({ conversationId, userId }))

    if (!participant?.id) {
      return null
    }

    return participant
  }

  async getParticipantsByMsgId(messageId: number): Promise<Participant[]> {
    const message = await this.messagesRepository.findOne(
      { id: messageId },
      { relations: ['conversation', 'conversation.participants'] }
    )

    return message?.conversation?.participants || []
  }

  async createMsg(createMessageDto: CreateMessageDto): Promise<Message> {
    return await this.messagesRepository.create({ ...createMessageDto })
  }

  async getAndCount(getMessagesDto: GetMessagesDto) {
    const { page, perPage, order, searchText, conversationId } = getMessagesDto

    const conditions: FindOptionsWhere<Message> = { conversationId }

    if (searchText) {
      conditions.body = Like(`%${searchText.trim()}%`)
    }

    const findAndCountInput: FindAndCountInput<Message> = {
      conditions,
      relations: ['participant', 'participant.user'],
      take: perPage,
      skip: (page - 1) * perPage,
      order
    }
    return await this.messagesRepository.findAndCount(findAndCountInput)
  }

  async getById(messageId: number): Promise<Message | null> {
    return await this.messagesRepository.findOne({ id: messageId }, { relations: ['participant', 'participant.user'] })
  }

  async updateById(messageId: number, updateMessageDto: UpdateMessageDto): Promise<Message | null> {
    await this.messagesRepository.update({ id: messageId }, updateMessageDto)
    return await this.getById(messageId)
  }

  async deleteById(messageId: number): Promise<void> {
    await this.messagesRepository.delete({ id: messageId })
  }
}
