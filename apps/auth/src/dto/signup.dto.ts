import { EmailField, StringField } from '@app/common/validators'

export class SigninDto {
  @EmailField()
  email: string

  @StringField({ example: 'password' })
  password: string
}
