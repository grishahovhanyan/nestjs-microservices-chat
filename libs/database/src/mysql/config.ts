import { ConfigService } from '@nestjs/config'
import * as path from 'path'
import { DataSourceOptions } from 'typeorm'

const configService = new ConfigService()

export const MYSQL_CONFIGS: DataSourceOptions = {
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: +configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USER'),
  password: `${configService.get('MYSQL_PASSWORD')}`,
  database: configService.get('MYSQL_DATABASE'),
  entities: [path.join(__dirname, 'entities', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  logging: configService.get('MYSQL_LOGGING') === 'true',
  synchronize: configService.get('MYSQL_SYNCHRONIZE') === 'true',
  dropSchema: configService.get('MYSQL_DROP_SCHEMA') === 'true'
}
