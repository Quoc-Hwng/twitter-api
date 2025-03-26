import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'
import { UnauthorizedError, InternalServerError } from '~/utils/errors'

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        reject(error)
        return
      }
      resolve(token!)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          return reject(new UnauthorizedError('Token expired'))
        }
        if (error.name === 'JsonWebTokenError') {
          return reject(new UnauthorizedError('Invalid token'))
        }
        if (error.name === 'NotBeforeError') {
          return reject(new UnauthorizedError('Token not active yet'))
        }
        // Các lỗi không xác định -> Trả về Internal Server Error
        return reject(new InternalServerError('Failed to verify token'))
      }
      resolve(decoded as TokenPayload)
    })
  })
}

export const getExpiresIn = (value: string): number | `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}` => {
  return isNaN(Number(value)) ? (value as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`) : Number(value)
}
