import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit
} from '@nestjs/common'
import { ClientGrpc, ClientProxy } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { firstValueFrom } from 'rxjs'
import { Repository } from 'typeorm'

import { ChatSocketEvents, EMIT_SOCKET_EVENT_MSG_PATTERN, paginatedResponse, SUCCESS_RESPONSE } from '@app/common'
import { DbRelations, Participant } from '@app/database'
import { AUTH_SERVICE, USERS_PACKAGE, USERS_SERVICE_NAME, UsersGrpcServiceClient } from '@app/microservices'

import { CreateParticipantDto, GetParticipantsDto, UpdateParticipantDto } from './dto'
import { ParticipantsRepository } from './participants.repository'

@Injectable()
export class ParticipantsService implements OnModuleInit {
  private usersService: UsersGrpcServiceClient

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
    @Inject(USERS_PACKAGE) private readonly usersPackageClient: ClientGrpc,
    @InjectRepository(Participant)
    private readonly repo: Repository<Participant>,
    private readonly participantsRepository: ParticipantsRepository
  ) {}

  onModuleInit() {
    this.usersService = this.usersPackageClient.getService<UsersGrpcServiceClient>(USERS_SERVICE_NAME)
  }

  // ******* Controller Handlers *******
  async index(currentUserId: number, conversationId: number, query: GetParticipantsDto) {
    const participant = await this.getByConvIdAndUserId(conversationId, currentUserId)

    if (!participant) {
      throw new NotFoundException()
    }

    const { items, totalCount } = await this.getAndCount({
      ...query,
      conversationId,
      userId: currentUserId
    })

    return paginatedResponse(items, totalCount, query.page, query.perPage)
  }

  async create(currentUserId: number, conversationId: number, createParticipantDto: CreateParticipantDto) {
    const currentParticipant = await this.getByConvIdAndUserId(conversationId, currentUserId)

    if (!currentParticipant) {
      throw new NotFoundException()
    }

    if (!currentParticipant.isAdmin) {
      throw new ForbiddenException()
    }

    const existingParticipant = await this.getByConvIdAndUserId(conversationId, createParticipantDto.userId)

    if (existingParticipant) {
      throw new BadRequestException('User already exists in this conversation')
    }

    const user = await this.getUserById(createParticipantDto.userId)
    if (!user?.id) {
      throw new NotFoundException()
    }

    const participant = await this.createParticipant({ ...createParticipantDto, conversationId })

    const participants = await this.getByConvId(conversationId)

    await this.emitSocketEvent(
      participants.map(({ userId }) => userId),
      ChatSocketEvents.participantCreated,
      {
        userId: currentUserId,
        participant
      }
    )

    return participant
  }

  async find(currentUserId: number, conversationId: number, participantId: number) {
    const currentParticipant = await this.getByConvIdAndUserId(conversationId, currentUserId)
    const participant = await this.getByConvIdAndPartId(conversationId, participantId)

    if (!currentParticipant || !participant) {
      throw new NotFoundException()
    }

    return participant
  }

  async update(
    currentUserId: number,
    conversationId: number,
    participantId: number,
    updateParticipantDto: UpdateParticipantDto
  ) {
    const currentParticipant = await this.getByConvIdAndUserId(conversationId, currentUserId)
    const participant = await this.getByConvIdAndPartId(conversationId, participantId)

    if (!currentParticipant || !participant) {
      throw new NotFoundException()
    }

    if (!currentParticipant.isAdmin) {
      throw new ForbiddenException()
    }

    if (!Object.keys(updateParticipantDto).length) {
      return participant
    }

    const updatedParticipant = await this.updateById(participantId, updateParticipantDto)

    const participants = await this.getByConvId(conversationId)

    await this.emitSocketEvent(
      participants.map(({ userId }) => userId),
      ChatSocketEvents.participantUpdated,
      {
        userId: currentUserId,
        participant
      }
    )

    return updatedParticipant
  }

  async delete(currentUserId: number, conversationId: number, participantId: number) {
    const currentParticipant = await this.getByConvIdAndUserId(conversationId, currentUserId)
    const participant = await this.getByConvIdAndPartId(conversationId, participantId)

    if (!currentParticipant || !participant) {
      throw new NotFoundException()
    }

    if (!currentParticipant.isAdmin || currentParticipant.id === participant.id) {
      throw new ForbiddenException()
    }

    await this.deleteById(participantId)

    const participants = await this.getByConvId(conversationId)

    await this.emitSocketEvent(
      participants.map(({ userId }) => userId),
      ChatSocketEvents.participantDeleted,
      {
        userId: currentUserId,
        participant
      }
    )

    return SUCCESS_RESPONSE
  }

  // ******* ******* ******* *******

  async emitSocketEvent(userIds: number[], event: string, data: any) {
    return firstValueFrom(this.authService.send(EMIT_SOCKET_EVENT_MSG_PATTERN, { userIds, event, data }))
  }

  async getUserById(userId: number) {
    return firstValueFrom(this.usersService.findOneUser({ userId }))
  }

  async createParticipant(createParticipantDto: CreateParticipantDto): Promise<Participant> {
    return await this.participantsRepository.create(createParticipantDto)
  }

  async bulkCreate(createParticipantsDto: CreateParticipantDto[]): Promise<Participant[]> {
    return await this.participantsRepository.bulkCreate(createParticipantsDto)
  }

  async getAndCount(getParticipantsDto: GetParticipantsDto) {
    const { page, perPage, order, searchText, userId, conversationId } = getParticipantsDto

    const qb = this.repo
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.user', 'user')
      .whereExists(
        this.repo
          .createQueryBuilder('participant')
          .select('1')
          .from('participants', 'p')
          .where('p.conversationId = :conversationId')
          .andWhere('p.userId = :userId')
      )
      .andWhere('participant.conversationId = :conversationId')

    if (searchText) {
      qb.andWhere('user.fullName LIKE :searchPattern')
    }

    if (order) {
      for (const [key, orderType] of Object.entries(order)) {
        qb.orderBy(`participant.${key}`, orderType)
      }
    }

    const [items, totalCount] = await qb
      .setParameter('userId', userId)
      .setParameter('conversationId', conversationId)
      .setParameter('searchPattern', `%${searchText}%`)
      .take(perPage)
      .skip((page - 1) * perPage)
      .getManyAndCount()

    return { items, totalCount }
  }

  async getById(participantId: number): Promise<Participant | null> {
    return await this.participantsRepository.findOne({ id: participantId }, { relations: ['user', 'conversation'] })
  }

  async getByConvId(conversationId: number): Promise<Participant[]> {
    return await this.participantsRepository.find({ conversationId })
  }

  async getByConvIdAndUserId(conversationId: number, userId: number): Promise<Participant | null> {
    return await this.participantsRepository.findOne({ conversationId, userId })
  }

  async getByConvIdAndPartId(conversationId: number, participantId: number): Promise<Participant | null> {
    return await this.participantsRepository.findOne(
      { conversationId, id: participantId },
      { relations: [DbRelations.user, DbRelations.conversation] }
    )
  }

  async updateById(participantId: number, updateParticipantDto: UpdateParticipantDto): Promise<Participant | null> {
    await this.participantsRepository.update({ id: participantId }, updateParticipantDto)
    return await this.getById(participantId)
  }

  async deleteById(participantId: number) {
    await this.participantsRepository.delete({ id: participantId })
  }
}
