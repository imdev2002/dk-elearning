import z from 'zod'

export const AccountBody = z.object({
  avatar: z.any(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  gender: z.string(),
  birthday: z.any(),
  syncWithGoogle: z.any(),
})

export type AccountBodyType = z.infer<typeof AccountBody>

export const AccountRes = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    gender: z.string(),
    password: z.null(),
    salt: z.null(),
    phone: z.string(),
    avatar: z.string(),
    birthday: z.string(),
    isVerified: z.boolean(),
    verifyCode: z.null(),
    platform: z.string(),
    refreshToken: z.string(),
    firstTime: z.boolean(),
    isNewUser: z.boolean(),
    timestamp: z.string(),
    roles: z.array(
      z.object({
        id: z.number(),
        timestamp: z.string(),
        roleId: z.number(),
        userId: z.number(),
        role: z.object({
          id: z.number(),
          name: z.string(),
          description: z.string(),
        }),
      })
    ),
  }),
})

export type AccountResType = z.infer<typeof AccountRes>
