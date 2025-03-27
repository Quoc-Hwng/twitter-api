import { Request } from 'express'
import { UnauthorizedError, ValidationError } from '~/utils/errors'
import { USERS_MESSAGES } from './messages'

export const Authorization = (req: Request) => {
  const authHeader = req.headers.authorization
  console.log('AccessToken', authHeader)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(' No token provided')
  }

  const accessToken = req.headers.authorization?.split(' ')[1]
  if (!accessToken) {
    throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
      { path: 'accessToken', message: 'Access token is required' }
    ])
  }
  return accessToken
}
