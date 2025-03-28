import { ForbiddenError, NotFoundError, UnauthorizedError } from './../utils/errors'
import { NextFunction, Response } from 'express'
import { ObjectId } from 'mongodb'
import databaseConfig from '~/config/database.config'
import { environment } from '~/config/env.config'
import { Authorization } from '~/constants/algorithms'
import { UserVerifyStatus } from '~/constants/enum'
import { USERS_MESSAGES } from '~/constants/messages'
import { verifyToken } from '~/utils/jwt'
import { AuthRequest } from '~/type'

export const isVerifiedUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = Authorization(req)
    const { userId, jti, verify } = await verifyToken({
      token,
      secretOrPublicKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE
    })
    const user = await databaseConfig.users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      next(new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND))
      return
    }
    if (verify !== UserVerifyStatus.Verified) {
      next(new ForbiddenError(USERS_MESSAGES.USER_NOT_VERIFIED))
      return
    }
    const isActive = await databaseConfig.refreshTokens.findOne({ token: jti })
    if (!isActive) {
      next(next(new UnauthorizedError(USERS_MESSAGES.ACCESS_TOKEN_INVALID)))
      return
    }
    req.userId = user?._id.toString()
    req.user = user

    next()
  } catch (error) {
    console.log(error)
    next(new UnauthorizedError('Unauthorized!'))
  }
}
