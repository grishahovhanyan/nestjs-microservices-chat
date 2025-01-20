import { Logger, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MySqlConfigService } from './mysql-config.service'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { DataSource } from 'typeorm'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: MySqlConfigService,
      async dataSourceFactory(options) {
        const logger = new Logger('Database')

        if (!options) {
          throw new Error('❌ [MySql database connection failed]: Invalid options passed')
        }

        try {
          const source = addTransactionalDataSource(new DataSource(options))
          await source.initialize()
          logger.log(`🎯 Database initialized successfully.`)

          return source
        } catch (error) {
          logger.error(`❌ [Database connection error]: ${error.message}`)
          throw error
        }
      }
    })
  ]
})
export class MysqlModule {}
