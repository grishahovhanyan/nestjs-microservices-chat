import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { UnauthorizedException } from '@app/common'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: Error, user) {
    if (err || !user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
