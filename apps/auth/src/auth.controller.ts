import { BadRequestException, Body, HttpCode, Post, UseGuards } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { Transactional } from 'typeorm-transactional'

import { Swagger } from '@app/swagger'
import { EnhancedController, ERROR_MESSAGES, TransformResponse } from '@app/common'
import { User } from '@app/database'

import { AuthService } from './auth.service'
import { SigninDto, SignupDto } from './dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { UsersService } from './users/users.service'

@EnhancedController('auth', false)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Swagger({ errorResponses: [400] })
  @Post('signup')
  @HttpCode(200)
  @Transactional()
  @TransformResponse(User)
  async signup(@Body() signupUserDto: SignupDto) {
    const user = await this.usersService.getByEmail(signupUserDto.email)

    if (user) {
      throw new BadRequestException(ERROR_MESSAGES.userAlreadyExists)
    }

    const createdUser = await this.usersService.create(signupUserDto)

    return createdUser
  }

  @Swagger({ errorResponses: [400] })
  @Post('signin')
  @HttpCode(200)
  async signin(@Body() signinDto: SigninDto) {
    const user = await this.authService.validateUser(signinDto.email, signinDto.password)

    return {
      accessToken: this.authService.getAccessToken({ userId: user.id })
    }
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  authenticate(@Payload() payload: any) {
    return payload.user
  }
}
