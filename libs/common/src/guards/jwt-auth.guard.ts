import { AUTH_SERVICE } from '@app/microservices'
import { ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ClientProxy } from '@nestjs/microservices'
import { AuthGuard } from '@nestjs/passport'
import { catchError, map, tap } from 'rxjs'

import { IS_PUBLIC_KEY, UnauthorizedException } from '@app/common'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger('JwtAuthGuard')

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
    private readonly reflector: Reflector
  ) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    const jwt = context.switchToHttp().getRequest().headers?.authorization?.split(' ').pop()

    return this.authService
      .send('authenticate', {
        authorization: jwt
      })
      .pipe(
        tap((res) => (context.switchToHttp().getRequest().user = res)),
        map(() => true),
        catchError((err) => {
          this.logger.error(err)
          throw new UnauthorizedException()
        })
      )
  }

  handleRequest(err: Error, user) {
    if (err || !user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
