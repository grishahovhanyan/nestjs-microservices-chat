import { VALIDATION_MESSAGES } from '@app/common'
import { StringField, EmailField, PasswordField } from '@app/common/validators'

export class SignupDto {
  @StringField({ example: 'John Doe' })
  fullName: string

  @EmailField()
  email: string

  @PasswordField()
  password: string

  @StringField({ example: 'password', matchKey: 'password', matchMessage: VALIDATION_MESSAGES.passwordMismatch })
  confirmPassword: string
}

export class SigninDto {
  @EmailField()
  email: string

  @StringField({ example: 'password' })
  password: string
}
