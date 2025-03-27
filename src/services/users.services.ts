import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { LoginBodyType, RegisterBodyType } from '../schemaValidations/auth.schema'
import { compareValue, hashValue } from '~/utils/bcrypt'
import { getExpiresIn, signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { environment } from '~/config/env.config'
import { ObjectId } from 'mongodb'
import { NotFoundError, ValidationError } from '~/utils/errors'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USERS_MESSAGES } from '~/constants/messages'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

class UsersService {
  private signAccessToken({ userId, jti }: { userId: string; jti: string }) {
    return signToken({
      payload: {
        userId,
        jti,
        token_type: TokenType.AccessToken
      },
      privateKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.ACCESS_TOKEN_LIFE)
      }
    })
  }
  private signRefreshToken({ userId, jti, exp }: { userId: string; jti: string; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          userId,
          jti,
          token_type: TokenType.RefreshToken,
          exp
        },
        privateKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE
      })
    }
    return signToken({
      payload: {
        userId,
        jti,
        token_type: TokenType.RefreshToken
      },
      privateKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.REFRESH_TOKEN_LIFE)
      }
    })
  }
  private signEmailVerifyToken({ userId, emailVerifyToken }: { userId: string; emailVerifyToken: string }) {
    return signToken({
      payload: {
        userId,
        emailVerifyToken,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: environment.EMAIL_VERIFY_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.EMAIL_VERIFY_TOKEN_LIFE)
      }
    })
  }
  private signPasswordResetToken({ userId, passwordResetToken }: { userId: string; passwordResetToken: string }) {
    return signToken({
      payload: {
        userId,
        passwordResetToken,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: environment.FORGOT_PASSWORD_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.FORGOT_PASSWORD_TOKEN_LIFE)
      }
    })
  }

  private signAccessAndRefreshToken({ userId, jti }: { userId: string; jti: string }) {
    return Promise.all([this.signAccessToken({ userId, jti }), this.signRefreshToken({ userId, jti })])
  }
  private decodeAccessToken(accessToken: string) {
    return verifyToken({
      token: accessToken,
      secretOrPublicKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE
    })
  }
  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE
    })
  }
  private decodeEmailVerifyToken(emailVerifyToken: string) {
    return verifyToken({
      token: emailVerifyToken,
      secretOrPublicKey: environment.EMAIL_VERIFY_TOKEN_SECRET_SIGNATURE
    })
  }

  async register(data: RegisterBodyType) {
    const hashedPassword = await hashValue(data.password)
    const emailVerifyToken = uuidv4()
    const result = await databaseConfig.users.insertOne(
      new User({
        ...data,
        password: hashedPassword,
        verifyEmailToken: emailVerifyToken,
        date_of_birth: new Date(data.date_of_birth),
        _destroy: false
      })
    )
    const userId = result.insertedId.toString()
    const user = await this.findUserById(userId)
    const verifyEmailToken = await this.signEmailVerifyToken({ userId, emailVerifyToken })
    console.log(verifyEmailToken)

    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId,
      jti: emailVerifyToken
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseConfig.refreshTokens.insertOne(
      new RefreshToken({ userId: new ObjectId(userId), token: emailVerifyToken, iat, exp })
    )
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user?.email,
        name: user?.name,
        avatar: user?.avatar,
        date_of_birth: user?.date_of_birth.toISOString()
      }
    }
  }

  async findUserByEmail(email: string) {
    return databaseConfig.users.findOne({ email })
  }

  async findUserById(userId: string) {
    return databaseConfig.users.findOne({ _id: new ObjectId(userId) })
  }

  async login(data: LoginBodyType) {
    //Validate email, password
    const user = await this.findUserByEmail(data.email)
    if (!user) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'email', message: USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD }
      ])
    }
    const isMatchPassword = await compareValue(data.password, user.password)
    if (!isMatchPassword) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'password', message: USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD }
      ])
    }

    //Logic login
    const userId = user._id.toString()
    const jti = uuidv4()
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId,
      jti
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseConfig.refreshTokens.insertOne(new RefreshToken({ userId: user._id, token: jti, iat, exp }))
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        date_of_birth: user.date_of_birth.toISOString()
      }
    }
  }

  //RefreshToken
  async refreshToken({ refreshToken }: { refreshToken: string }) {
    const { userId, jti: oldJti } = await this.decodeRefreshToken(refreshToken)
    if (!userId || !oldJti) {
      throw new Error('Invalid refresh token')
    }
    const newJti = uuidv4()
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({
        userId,
        jti: newJti
      }),
      this.signRefreshToken({
        userId,
        jti: newJti
      }),
      databaseConfig.refreshTokens.deleteOne({ token: oldJti })
    ])
    const { iat, exp } = await this.decodeRefreshToken(newRefreshToken)
    await databaseConfig.refreshTokens.insertOne(
      new RefreshToken({ userId: new ObjectId(userId), token: newJti, iat, exp })
    )
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }

  //Logout
  async logout(refreshToken: string) {
    const { jti } = await this.decodeRefreshToken(refreshToken)
    const result = await databaseConfig.refreshTokens.deleteOne({ token: jti })

    if (result.deletedCount === 0) {
      throw new NotFoundError(USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST)
    }
  }

  //Verify Account
  async verifyEmail(token: string) {
    const { userId, emailVerifyToken } = await this.decodeEmailVerifyToken(token)
    const user = await this.findUserById(userId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    if (user.verifyEmailToken !== emailVerifyToken) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'token', message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED }
      ])
    }
    if (user.verify === UserVerifyStatus.Verified) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'token', message: USERS_MESSAGES.YOUR_ACCOUNT_IS_ALREADY_ACTIVE }
      ])
    }
    await databaseConfig.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verify: UserVerifyStatus.Verified,
          verifyEmailToken: ''
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
  }

  //Resend Verify Email
  async reSendVerifyEmail(token: string) {
    const { userId } = await this.decodeAccessToken(token)
    const user = await this.findUserById(userId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    if (user.verify === UserVerifyStatus.Verified) {
      return USERS_MESSAGES.YOUR_ACCOUNT_IS_ALREADY_ACTIVE
    }
    await databaseConfig.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verifyEmailToken: uuidv4()
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
  }

  async forgotPassword(email: string) {
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    const userId = user._id.toString()

    const passwordResetToken = uuidv4()
    await databaseConfig.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          forgotPasswordToken: passwordResetToken
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    const Token = await this.signPasswordResetToken({ userId, passwordResetToken })
    console.log(Token)
    return USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
  }
}

const usersService = new UsersService()
export default usersService
