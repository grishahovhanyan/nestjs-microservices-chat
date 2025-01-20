import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ClientGrpc, ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

import {
  ChatSocketEvents,
  EMIT_SOCKET_EVENT_MSG_PATTERN,
  ForbiddenException,
  NotFoundException,
  paginatedResponse,
  SUCCESS_RESPONSE
} from '@app/common'
import { Conversation } from '@app/database'
import {
  AUTH_SERVICE,
  UsersGrpcServiceClient,
  ParticipantsGrpcServiceClient,
  USERS_PACKAGE,
  USERS_SERVICE_NAME,
  PARTICIPANTS_PACKAGE,
  PARTICIPANTS_SERVICE_NAME
} from '@app/microservices'
import { GetConversationsDto, CreateConversationDto, UpdateConversationDto } from './dto/conversation.dto'
import { ConversationsRepository } from './conversations.repository'

@Injectable()
export class ConversationsService implements OnModuleInit {
  private usersService: UsersGrpcServiceClient
  private participantsService: ParticipantsGrpcServiceClient

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
    @Inject(USERS_PACKAGE) private readonly usersPackageClient: ClientGrpc,
    @Inject(PARTICIPANTS_PACKAGE) private readonly participantsPackageClient: ClientGrpc,
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>, // Can be used to create queryBuilder
    private readonly conversationsRepository: ConversationsRepository
  ) {}

  onModuleInit() {
    this.usersService = this.usersPackageClient.getService<UsersGrpcServiceClient>(USERS_SERVICE_NAME)
    this.participantsService =
      this.participantsPackageClient.getService<ParticipantsGrpcServiceClient>(PARTICIPANTS_SERVICE_NAME)
  }

  // ******* Controller Handlers *******
  async index(currentUserId: number, query: GetConversationsDto) {
    const { items, totalCount } = await this.getAndCount({
      ...query,
      userId: currentUserId
    })

    return paginatedResponse(items, totalCount, query.page, query.perPage)
  }

  async create(currentUserId: number, createConversationDto: CreateConversationDto) {
    const uniqueUserIds = [...new Set([...createConversationDto.userIds, currentUserId])]
    const { results: users } = await this.getUsersByIds(uniqueUserIds)

    if (users.length !== uniqueUserIds.length) {
      throw new NotFoundException()
    }

    const conversation = await this.createConversation({ creatorId: currentUserId, ...createConversationDto })

    await this.emitSocketEvent(
      conversation.participants.map(({ userId }) => userId),
      ChatSocketEvents.conversationCreated,
      {
        userId: currentUserId,
        conversation
      }
    )

    return conversation
  }

  async find(currentUserId: number, conversationId: number) {
    const conversation = await this.getByConvIdAndUserId(conversationId, currentUserId)

    if (!conversation) {
      throw new NotFoundException()
    }

    return conversation
  }

  async update(currentUserId: number, conversationId: number, updateConversationDto: UpdateConversationDto) {
    const conversation = await this.getByConvIdAndUserId(conversationId, currentUserId)

    if (!conversation) {
      throw new NotFoundException()
    }

    const updatedConversation = await this.updateById(conversationId, updateConversationDto)

    await this.emitSocketEvent(
      conversation.participants.map(({ userId }) => userId),
      ChatSocketEvents.conversationUpdated,
      {
        userId: currentUserId,
        conversation: updatedConversation
      }
    )

    return updatedConversation
  }

  async delete(currentUserId: number, conversationId: number) {
    const conversation = await this.getByConvIdAndUserId(conversationId, currentUserId)

    if (!conversation) {
      throw new NotFoundException()
    }

    const currentParticipant = conversation.participants.find(({ userId }) => userId === currentUserId)
    if (!currentParticipant.isAdmin) {
      throw new ForbiddenException()
    }

    await this.deleteById(conversationId)

    await this.emitSocketEvent(
      conversation.participants.map(({ userId }) => userId),
      ChatSocketEvents.conversationDeleted,
      {
        userId: currentUserId,
        conversation
      }
    )

    return SUCCESS_RESPONSE
  }

  // ******* ******* ******* *******

  async emitSocketEvent(userIds: number[], event: string, data: any) {
    return firstValueFrom(this.authService.send(EMIT_SOCKET_EVENT_MSG_PATTERN, { userIds, event, data }))
  }

  async getUsersByIds(userIds: number[]) {
    return firstValueFrom(this.usersService.findUsersByIds({ userIds }))
  }

  async createParticipants(createParticipantsInput) {
    const { results: participants } = await firstValueFrom(
      this.participantsService.createParticipants({ createParticipantsInput })
    )

    return participants
  }

  async createConversation(createConversationDto: CreateConversationDto) {
    const { creatorId, name, userIds } = createConversationDto

    const conversation = await this.conversationsRepository.create({ creatorId, name })

    const createParticipantsInput = this.prepareCreateParticipantsInput(conversation.id, creatorId, userIds)
    conversation.participants = await this.createParticipants(createParticipantsInput)

    return conversation
  }

  async getAndCount(getConversationsDto: GetConversationsDto) {
    const { page, perPage, order, userId, searchText, groupOnly, p2pOnly } = getConversationsDto

    const qb = this.repo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .whereExists(
        this.repo
          .createQueryBuilder('participant')
          .select('1')
          .from('participants', 'p')
          .where('p.conversationId = conversation.id')
          .andWhere('p.userId = :userId')
      )
      .leftJoinAndSelect('participant.user', 'user')

    if (searchText) {
      qb.andWhere('conversation.name LIKE :searchPattern')
    }

    if (groupOnly) {
      qb.andWhere('conversation.isGroup = TRUE')
    }

    if (p2pOnly) {
      qb.andWhere('conversation.isGroup = FALSE')
    }

    if (order) {
      for (const [key, orderType] of Object.entries(order)) {
        qb.orderBy(`conversation.${key}`, orderType)
      }
    }

    const [items, totalCount] = await qb
      .setParameter('userId', userId)
      .setParameter('searchPattern', `%${searchText}%`)
      .take(perPage)
      .skip((page - 1) * perPage)
      .getManyAndCount()

    return { items, totalCount }
  }

  async getById(conversationId: number): Promise<Conversation | null> {
    return await this.conversationsRepository.findOne(
      { id: conversationId },
      { relations: ['participants', 'participants.user'] }
    )
  }

  async getByConvIdAndUserId(conversationId: number, userId: number): Promise<Conversation | null> {
    return await this.repo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .whereExists(
        this.repo
          .createQueryBuilder('participant')
          .select('1')
          .from('participants', 'p')
          .where('p.conversationId = conversation.id')
          .andWhere('p.userId = :userId')
      )
      .andWhere('conversation.id = :conversationId')
      .setParameter('userId', userId)
      .setParameter('conversationId', conversationId)
      .getOne()
  }

  async updateById(conversationId: number, updateConversationDto: UpdateConversationDto): Promise<Conversation | null> {
    await this.conversationsRepository.update({ id: conversationId }, updateConversationDto)
    return await this.getById(conversationId)
  }

  async deleteById(conversationId: number) {
    await this.conversationsRepository.delete({ id: conversationId })
  }

  prepareCreateParticipantsInput(conversationId: number, creatorId: number, userIds: number[]) {
    return [...new Set([...userIds, creatorId])].map((userId: number) => ({
      userId,
      conversationId,
      isAdmin: userId === creatorId
    }))
  }
}
