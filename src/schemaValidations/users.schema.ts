import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(50, 'Password must be at most 50 characters')
  .refine((value) => /[a-z]/.test(value), 'Password must contain at least one lowercase letter')
  .refine((value) => /[A-Z]/.test(value), 'Password must contain at least one uppercase letter')
  .refine((value) => /\d/.test(value), 'Password must contain at least one number')
  .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), 'Password must contain at least one special character')

//Register
export const RegisterBody = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').trim(),

    email: z.string().email('Invalid email format').trim(),

    password: passwordSchema,

    confirmPassword: passwordSchema,
    birthDate: z.string().refine((value) => !isNaN(Date.parse(value)), 'Invalid date format (ISO8601 expected)')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  })

export type RegisterBodyType = z.infer<typeof RegisterBody>

export const RegisterRes = z.object({
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable()
    })
  })
})

export type RegisterResponse = z.infer<typeof RegisterRes>

export const LoginBody = z
  .object({
    email: z.string().trim().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(100, { message: 'Password must be at most 100 characters' })
  })
  .strict()

export type LoginBodyType = z.infer<typeof LoginBody>

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable()
    })
  }),
  message: z.string()
})

export type LoginResType = z.TypeOf<typeof LoginRes>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  }),
  message: z.string()
})

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>

export const LogoutBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>

export const LoginGoogleQuery = z.object({
  code: z.string()
})

export const VerifyEmailBody = z
  .object({
    verifyToken: z
      .string({
        required_error: 'Token is required',
        invalid_type_error: 'Token must be a string'
      })
      .min(1, 'Token cannot be empty')
  })
  .strict()

export type VerifyEmailBodyType = z.TypeOf<typeof VerifyEmailBody>

export const VerifyEmailRes = z.object({
  message: z.string()
})

export type VerifyEmailResType = z.TypeOf<typeof VerifyEmailRes>

export const ReSendVerifyEmailRes = z.object({
  message: z.string()
})

export type ReSendVerifyEmailResType = z.TypeOf<typeof VerifyEmailRes>

export const PasswordResetTokenBody = z
  .object({
    email: z.string().email('Invalid email format').trim()
  })
  .strict()

export type PasswordResetTokenBodyType = z.TypeOf<typeof PasswordResetTokenBody>

export const PasswordResetTokenRes = z.object({
  message: z.string()
})

export type PasswordResetTokenType = z.TypeOf<typeof PasswordResetTokenRes>

export const VerifyPasswordResetBody = z
  .object({
    verifyToken: z
      .string({
        required_error: 'Token is required',
        invalid_type_error: 'Token must be a string'
      })
      .min(1, 'Token cannot be empty')
  })
  .strict()

export type VerifyPasswordResetBodyType = z.TypeOf<typeof VerifyPasswordResetBody>

export const VerifyPasswordResetRes = z.object({
  message: z.string()
})

export type VerifyPasswordResetResType = z.TypeOf<typeof VerifyPasswordResetRes>

export const PasswordResetBody = z
  .object({
    verifyToken: z
      .string({
        required_error: 'Token is required',
        invalid_type_error: 'Token must be a string'
      })
      .min(1, 'Token cannot be empty'),
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  })

export type PasswordResetBodyType = z.TypeOf<typeof PasswordResetBody>

export const PasswordResetRes = z.object({
  message: z.string()
})

export type PasswordResetResType = z.TypeOf<typeof PasswordResetRes>

export const GetMeRes = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
    birthDate: z.string(),
    bio: z.string(),
    location: z.string(),
    website: z.string(),
    username: z.string(),
    coverPhoto: z.string(),
    verify: z.string()
  })
})

export type GetMeResType = z.TypeOf<typeof GetMeRes>

export const UpdateMeBody = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  username: z.string().min(3).max(30).optional(),
  avatar: z.string().optional(),
  coverPhoto: z.string().optional(),
  birthDate: z.date().optional()
})

export type UpdateMeBodyType = z.infer<typeof UpdateMeBody>

export const UpdateMeRes = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
    birthDate: z.string(),
    coverPhoto: z.string(),
    username: z
      .string()
      .min(4, 'Username must be at least 4 characters')
      .max(15, 'Username must be at most 15 characters')
      .regex(/^(?!\d+$)[a-zA-Z0-9](?:[a-zA-Z0-9_]*[a-zA-Z0-9])?$/, 'Invalid username format'),
    bio: z.string(),
    location: z.string(),
    website: z.string()
  })
})

export type UpdateMeResType = z.TypeOf<typeof UpdateMeRes>

export const GetProfileParam = z.object({
  username: z.string()
})

export type GetProfileParamType = z.TypeOf<typeof GetProfileParam>

export const GetProfileRes = z.object({
  message: z.string(),
  data: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable(),
      birthDate: z.string(),
      coverPhoto: z.string(),
      username: z.string(),
      bio: z.string(),
      location: z.string(),
      website: z.string(),
      isPrivate: z.boolean()
    })
    .transform((data) => {
      if (data.isPrivate) {
        return {
          username: data.username,
          name: data.name,
          avatar: z.string().nullable(),
          bio: z.string()
        }
      }
      return data
    })
})

export type GetProfileResType = z.TypeOf<typeof GetProfileRes>

export const FollowBody = z.object({
  targetUserId: z.string()
})

export type FollowBodyType = z.TypeOf<typeof FollowBody>

export const FollowRes = z.object({
  followStatus: z.string(),
  message: z.string()
})

export type FollowResType = z.TypeOf<typeof FollowRes>

export const UnFollowRes = z.object({
  message: z.string()
})

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string().min(6, 'Old password must be at least 6 characters'),
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type ChangePasswordType = z.infer<typeof ChangePasswordBody>

export const ChangePasswordRes = z.object({
  message: z.string()
})

export type ChangePasswordResType = z.TypeOf<typeof ChangePasswordRes>
