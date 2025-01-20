import { Injectable } from '@nestjs/common'
import { In, Like, Not } from 'typeorm'

import { FindAndCountInput, User } from '@app/database'
import { GetUsersDto, UpdateUserDto } from './dto/user.dto'
import { SignupDto } from '../dto/auth.dto'

import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: SignupDto): Promise<User> {
    return await this.usersRepository.create(createUserDto)
  }

  async getById(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({ id: userId })
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ email })
  }

  async getByIds(userIds: number[]): Promise<User[]> {
    return await this.usersRepository.find({ id: In(userIds) })
  }

  async getAndCount(getUsersDto: GetUsersDto) {
    const { page, perPage, order, searchText, userIdsToExclude, userIdsToInclude } = getUsersDto

    const findAndCountInput: FindAndCountInput<User> = {
      conditions: {
        ...(searchText?.trim() ? { fullName: Like(`%${searchText.trim()}%`) } : {}),
        ...(userIdsToExclude?.length ? { id: Not(In(userIdsToExclude)) } : {}),
        ...(userIdsToInclude?.length ? { id: In(userIdsToExclude) } : {})
      },
      take: perPage,
      skip: (page - 1) * perPage,
      order
    }

    return await this.usersRepository.findAndCount(findAndCountInput)
  }

  async updateById(userId: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update({ id: userId }, updateUserDto)
  }
}
