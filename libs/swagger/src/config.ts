import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger'

export const SWAGGER_CONFIGS = {
  defaultTitle: 'NestJS Chat',
  defaultDescription: 'NestJS Chat API',
  version: '1.0'
}

export const SWAGGER_OPTIONS: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    requestInterceptor: (req) => {
      req.credentials = 'include'
      return req
    }
  },
  customSiteTitle: 'NestJS - Swagger'
}

export const getSwaggerConfigs = (title?: string, description?: string) => {
  return new DocumentBuilder()
    .setTitle(title ?? SWAGGER_CONFIGS.defaultTitle)
    .setDescription(description ?? SWAGGER_CONFIGS.defaultDescription)
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' })
    .build()
}

export const getSwaggerOptions = (title: string) => ({
  ...SWAGGER_OPTIONS,
  customSiteTitle: title
})
