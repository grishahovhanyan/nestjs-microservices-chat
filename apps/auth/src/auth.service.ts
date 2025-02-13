import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { HashService, VALIDATION_MESSAGES } from '@app/common'

import { UsersService } from './users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getByEmail(email)
    if (!user || !HashService.compare(pass, user.password)) {
      throw new BadRequestException(VALIDATION_MESSAGES.invalidEmailPassword)
    }

    return user
  }

  getAccessToken(payload: { userId: number }): string {
    return this.jwtService.sign(payload)
  }
}
