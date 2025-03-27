import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'

export interface TokenPayload extends JwtPayload {
  userId: string
  token_type: TokenType
  jti: string
  verify: UserVerifyStatus
  exp: number
  iat: number
}
