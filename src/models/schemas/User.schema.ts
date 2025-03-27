import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

const objectIdSchema = z.instanceof(ObjectId).optional()

export const User = z.object({
  _id: objectIdSchema,
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  birthDate: z.date().default(new Date()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  verifyEmailToken: z.string().optional().default(''),
  forgotPasswordToken: z.string().optional().default(''),
  verify: z.nativeEnum(UserVerifyStatus).default(UserVerifyStatus.Unverified),

  bio: z.string().optional().default(''),
  location: z.string().optional().default(''),
  website: z.string().optional().default(''),
  username: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
  coverPhoto: z.string().optional().default(''),

  _destroy: z.boolean().default(false)
})

export type UserType = z.infer<typeof User>
