import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

export const AppConfigModule = (validationSchemaObject: Joi.PartialSchemaMap<any>) => {
  return ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object(validationSchemaObject)
  })
}
