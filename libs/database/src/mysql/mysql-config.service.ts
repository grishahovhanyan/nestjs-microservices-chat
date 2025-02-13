import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

import { MYSQL_ENTITIES } from './entities'

@Injectable()
export class MySqlConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('MYSQL_HOST'),
      port: +this.configService.get('MYSQL_PORT'),
      username: this.configService.get('MYSQL_USER'),
      password: `${this.configService.get('MYSQL_PASSWORD')}`,
      database: this.configService.get('MYSQL_DATABASE'),
      entities: MYSQL_ENTITIES,
      logging: this.configService.get('MYSQL_LOGGING') === 'true',
      synchronize: this.configService.get('MYSQL_SYNCHRONIZE') === 'true',
      dropSchema: this.configService.get('MYSQL_DROP_SCHEMA') === 'true'
    }
  }
}
