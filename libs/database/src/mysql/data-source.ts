import { ConfigService } from '@nestjs/config'
import { join } from 'path'
import { DataSource } from 'typeorm'
import 'dotenv/config'
import 'tsconfig-paths/register'

const configService = new ConfigService()

const entities = [join(__dirname, 'entities', '*.entity{.ts,.js}')]
const migrations = [join(__dirname, 'migrations', '*{.ts,.js}')]

export default new DataSource({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: +configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USER'),
  password: `${configService.get('MYSQL_PASSWORD')}`,
  database: configService.get('MYSQL_DATABASE'),
  entities,
  migrations,
  logging: configService.get('MYSQL_LOGGING') === 'true',
  synchronize: configService.get('MYSQL_SYNCHRONIZE') === 'true',
  dropSchema: configService.get('MYSQL_DROP_SCHEMA') === 'true'
})
