import databaseConfig from '~/config/database.config'
import {
  ChangePasswordType,
  LoginBodyType,
  PasswordResetBodyType,
  RegisterBodyType,
  UpdateMeBodyType
} from '../schemaValidations/users.schema'
import { compareValue, hashValue } from '~/utils/bcrypt'
import { getExpiresIn, signToken, verifyToken } from '~/utils/jwt'
import { FollowStatus, TokenType, UserVerifyStatus } from '~/constants/enum'
import { environment } from '~/config/env.config'
import { ObjectId } from 'mongodb'
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '~/utils/errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { v4 as uuidv4 } from 'uuid'
import { User, UserType } from '~/models/schemas/User.schema'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { FollowerSchema } from '~/models/schemas/Follower.schema'

class UsersService {
  private signAccessToken({ userId, jti, verify }: { userId: string; jti: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        jti,
        verify,
        token_type: TokenType.AccessToken
      },
      privateKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.ACCESS_TOKEN_LIFE)
      }
    })
  }
  private signRefreshToken({
    userId,
    jti,
    verify,
    exp
  }: {
    userId: string
    jti: string
    exp?: number
    verify: UserVerifyStatus
  }) {
    if (exp) {
      return signToken({
        payload: {
          userId,
          jti,
          verify,
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
        verify,
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
        jti: emailVerifyToken,
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
        jti: passwordResetToken,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: environment.FORGOT_PASSWORD_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.FORGOT_PASSWORD_TOKEN_LIFE)
      }
    })
  }

  private signAccessAndRefreshToken({
    userId,
    jti,
    verify
  }: {
    userId: string
    jti: string
    verify: UserVerifyStatus
  }) {
    return Promise.all([this.signAccessToken({ userId, jti, verify }), this.signRefreshToken({ userId, jti, verify })])
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
  private decodePasswordResetToken(verifyForgotPasswordToken: string) {
    return verifyToken({
      token: verifyForgotPasswordToken,
      secretOrPublicKey: environment.FORGOT_PASSWORD_TOKEN_SECRET_SIGNATURE
    })
  }

  async register(data: RegisterBodyType) {
    const existingUser = await usersService.findUserByEmail(data.email)
    if (existingUser) {
      throw new ConflictError(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
    }
    const hashedPassword = await hashValue(data.password)
    const emailVerifyToken = uuidv4()
    const dataValidate = User.parse({
      ...data,
      username: emailVerifyToken,
      password: hashedPassword,
      verifyEmailToken: emailVerifyToken,
      birthDate: new Date(data.birthDate),
      _destroy: false
    })
    const result = await databaseConfig.users.insertOne(dataValidate)

    const userId = result.insertedId.toString()
    const user = await this.findUserById(userId)
    const verifyEmailToken = await this.signEmailVerifyToken({ userId, emailVerifyToken })
    console.log(verifyEmailToken)

    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId,
      jti: emailVerifyToken,
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    const refreshTokenData = RefreshToken.parse({ userId: new ObjectId(userId), token: emailVerifyToken, iat, exp })
    await databaseConfig.refreshTokens.insertOne(refreshTokenData)
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user?.email,
        name: user?.name,
        avatar: user?.avatar
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
      throw new UnauthorizedError(USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD)
    }
    const isMatchPassword = await compareValue(data.password, user.password)
    if (!isMatchPassword) {
      throw new UnauthorizedError(USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD)
    }

    //Logic login
    const userId = user._id.toString()
    const jti = uuidv4()
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId,
      jti,
      verify: user.verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    const refreshTokenData = RefreshToken.parse({ userId: user._id, token: jti, iat, exp })
    await databaseConfig.refreshTokens.insertOne(refreshTokenData)
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    }
  }

  //RefreshToken
  async refreshToken({ refreshToken }: { refreshToken: string }) {
    const { userId, jti: oldJti } = await this.decodeRefreshToken(refreshToken)
    if (!userId || !oldJti) {
      throw new UnauthorizedError(USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID)
    }
    const user = await this.findUserById(userId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    const newJti = uuidv4()
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({
        userId,
        jti: newJti,
        verify: user.verify
      }),
      this.signRefreshToken({
        userId,
        jti: newJti,
        verify: user.verify
      }),
      databaseConfig.refreshTokens.deleteOne({ token: oldJti })
    ])
    const { iat, exp } = await this.decodeRefreshToken(newRefreshToken)
    const refreshTokenData = RefreshToken.parse({ userId: new ObjectId(userId), token: newJti, iat, exp })
    await databaseConfig.refreshTokens.insertOne(refreshTokenData)
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
    const { userId, jti: emailVerifyToken } = await this.decodeEmailVerifyToken(token)
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
      throw new ForbiddenError(USERS_MESSAGES.YOUR_ACCOUNT_IS_ALREADY_ACTIVE)
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
    const emailVerifyToken = uuidv4()
    await databaseConfig.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verifyEmailToken: emailVerifyToken
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    const verifyEmailToken = await this.signEmailVerifyToken({ userId, emailVerifyToken })
    console.log(verifyEmailToken)
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
  async verifyForgotPassword(token: string) {
    const { userId, jti: passwordResetToken } = await this.decodePasswordResetToken(token)
    const user = await this.findUserById(userId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    if (user.forgotPasswordToken !== passwordResetToken) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'token', message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED }
      ])
    }
    return USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  }
  async passwordReset(data: PasswordResetBodyType) {
    const { userId, jti: passwordResetToken } = await this.decodePasswordResetToken(data.verifyToken)
    const user = await this.findUserById(userId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    if (user.forgotPasswordToken !== passwordResetToken) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'token', message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED }
      ])
    }
    await databaseConfig.users.updateOne(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: {
          password: await hashValue(data.password),
          forgotPasswordToken: ''
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    await databaseConfig.refreshTokens.deleteMany({ userId: new ObjectId(userId) })

    return USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  }

  async getMe(token: string) {
    const { userId } = await this.decodeAccessToken(token)
    const user = await this.findUserById(userId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    return {
      id: userId,
      email: user?.email,
      name: user?.name,
      avatar: user?.avatar,
      birthDate: user?.birthDate.toISOString(),
      bio: user?.bio,
      location: user?.location,
      website: user?.website,
      username: user?.username,
      coverPhoto: user?.coverPhoto,
      verify: user?.verify.toString()
    }
  }

  async updateMe(token: string, data: UpdateMeBodyType) {
    const { userId } = await this.decodeAccessToken(token)
    const usernameExist = await databaseConfig.users.findOne({ username: data.username })

    if (usernameExist?.username === data.username) {
      throw new ConflictError(USERS_MESSAGES.USERNAME_EXISTED)
    }

    const user = await databaseConfig.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...data
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          forgotPasswordToken: 0,
          verifyEmailToken: 0,
          verify: 0,
          _destroy: 0
        }
      }
    )
    return {
      ...user,
      id: user?._id.toString(),
      birthDate: user?.birthDate.toISOString()
    }
  }
  async getProfile(username: string) {
    const user = await databaseConfig.users.findOne({ username })
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }
    return {
      id: user?._id.toString(),
      email: user?.email,
      name: user?.name,
      avatar: user?.avatar,
      birthDate: user?.birthDate.toISOString(),
      bio: user?.bio,
      location: user?.location,
      website: user?.website,
      username: user?.username,
      coverPhoto: user?.coverPhoto,
      isPrivate: user?.isPrivate
    }
  }
  async followUser(targetUserId: string, userId: string) {
    if (targetUserId === userId) {
      throw new ForbiddenError(USERS_MESSAGES.CANNOT_FOLLOW_YOURSELF)
    }
    const user = await this.findUserById(targetUserId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }

    const followExist = await databaseConfig.followers.findOne({
      followerId: new ObjectId(userId),
      followingId: new ObjectId(targetUserId)
    })
    if (followExist) {
      return followExist.followStatus
    }
    const followStatus = user.isPrivate ? FollowStatus.Requested : FollowStatus.Following
    const follower = FollowerSchema.parse({
      followerId: new ObjectId(userId),
      followingId: new ObjectId(targetUserId),
      followStatus
    })
    await databaseConfig.followers.insertOne(follower)
    return followStatus
  }
  async unFollowUser(targetUserId: string, userId: string) {
    const user = await this.findUserById(targetUserId)
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND)
    }

    const followExist = await databaseConfig.followers.findOne({
      followerId: new ObjectId(userId),
      followingId: new ObjectId(targetUserId)
    })
    if (!followExist) {
      return USERS_MESSAGES.ALREADY_UNFOLLOWED
    }
    await databaseConfig.followers.deleteOne(followExist)
    return USERS_MESSAGES.ALREADY_UNFOLLOWED
  }
  async changePassword(data: ChangePasswordType, userId: string, user: UserType) {
    if (!(await compareValue(data.oldPassword, user?.password))) {
      throw new UnauthorizedError(USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH)
    }
    const hashedPassword = await hashValue(data.newPassword)
    await databaseConfig.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    await databaseConfig.refreshTokens.deleteMany({ userId: new ObjectId(userId) })
    return USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  }
}

const usersService = new UsersService()
export default usersService
