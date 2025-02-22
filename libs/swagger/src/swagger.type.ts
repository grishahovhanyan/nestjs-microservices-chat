import { Type } from '@nestjs/common'

export interface SwaggerOptions<R = unknown> {
  response?: Type<R>
  pagination?: boolean
  isArray?: boolean
  params?: Array<{ name: string; type: Type; required?: boolean }>
  operation?: string
  description?: string
  errorResponses?: number[]
  201?: boolean
  400?: boolean
  401?: boolean
  403?: boolean
  404?: boolean
}
