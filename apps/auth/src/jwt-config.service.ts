import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get('JWT_SECRET'),
      signOptions: {
        expiresIn: this.configService.get('JWT_EXPIRATION')
      }
    }
  }
}
