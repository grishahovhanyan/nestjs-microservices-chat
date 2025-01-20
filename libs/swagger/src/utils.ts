import { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'

import { envService } from '@app/common'
import { getSwaggerConfigs, getSwaggerOptions } from './config'

export const registerSwaggerModule = (app: INestApplication<any>, title: string) => {
  if (!envService.isTestEnv() && !envService.isProductionEnv()) {
    const swaggerDocument = SwaggerModule.createDocument(app, getSwaggerConfigs(`Chat - ${title}`))
    SwaggerModule.setup('swagger-ui', app, swaggerDocument, getSwaggerOptions(`Chat - ${title}`))
  }
}
