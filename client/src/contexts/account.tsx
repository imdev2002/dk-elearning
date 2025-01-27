'use client'
import { User } from '@/app/globals'
import { clientTokens } from '@/lib/http'
import { AccountResType } from '@/schemaValidations/account.schema'
import { TokensType } from '@/schemaValidations/auth.schema'
import { userApiRequest } from '@/services/user.service'
import { setItem } from '@/utils/localStorage'
import { createContext, useContext, useEffect, useState } from 'react'
import { useReadLocalStorage } from 'usehooks-ts'

// type User = Omit<AccountResType['data'], 'refreshToken'>
// type UserTY = User

const AccountContext = createContext<{
  user: User | null
  setUser: (user: User | null) => void
  coursesBought: any
  setCoursesBought: (courses: any) => void
  coursesHearted: any
  setCoursesHearted: (courses: any) => void
  setRefreshAccountContex: (courses: any) => void
}>({
  user: null,
  setUser: () => {},
  coursesBought: [],
  setCoursesBought: () => {},
  coursesHearted: [],
  setCoursesHearted: () => {},
  setRefreshAccountContex: () => {},
})
export const useAccountContext = () => {
  const context = useContext(AccountContext)
  return context
}
export default function AccountProvider({
  children,
  inititalTokens = {
    accessToken: '',
    refreshToken: '',
  },
  initialUser = null,
}: {
  children: React.ReactNode
  inititalTokens?: TokensType
  initialUser?: User | null
}) {
  const initUser = useReadLocalStorage<any>('user')?.value

  const [user, setUser] = useState<User | null>(initUser)
  const [coursesBought, setCoursesBought] = useState<any>([])
  const [coursesHearted, setCoursesHearted] = useState<any>([])
  const [refreshAccountContex, setRefreshAccountContex] = useState(false)

  useState(() => {
    if (typeof window !== 'undefined') {
      clientTokens.value = inititalTokens
    }
  })

  useEffect(() => {
    async function fetchUser() {
      try {
        if (user?.id) {
          const res = await userApiRequest.get(user?.id)
          if (res.status === 200) {
            const user = res.payload
            setUser(user)
            setItem('user', user)
          }
        }
      } catch (error) {}
    }
    async function getCoursesBought() {
      try {
        if (user?.id) {
          const res = await userApiRequest.getCourseBought()
          if (res.status === 200) {
            setCoursesBought(res.payload)
          }
        }
      } catch (error) {}
    }
    async function getCoursesHearted() {
      try {
        if (user?.id) {
          const res = await userApiRequest.getWishList()
          if (res.status === 200) {
            setCoursesHearted((res.payload as any).courseHearted)
          }
        }
      } catch (error) {}
    }
    if (user?.avatar) {
      fetchUser()
      getCoursesBought()
      getCoursesHearted()
    }
  }, [refreshAccountContex])

  return (
    <AccountContext.Provider
      value={{
        user,
        setUser,
        coursesBought,
        setCoursesBought,
        coursesHearted,
        setCoursesHearted,
        setRefreshAccountContex,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

// 'use client'
// import { isClient } from '@/lib/utils'
// import { AccountResType } from '@/schemaValidations/account.schema'
// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from 'react'
// import { User } from '@/app/globals'

// const AccountContext = createContext<{
//   user: User | null
//   setUser: (user: User | null) => void
//   isAuthenticated: boolean
// }>({
//   user: null,
//   setUser: () => {},
//   isAuthenticated: false,
// })
// export const useAccountContext = () => {
//   const context = useContext(AccountContext)
//   return context
// }
// export default function AccountProvider({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const [user, setUserState] = useState<User | null>(() => {
//     // if (isClient()) {
//     //   const _user = localStorage.getItem('user')
//     //   return _user ? JSON.parse(_user) : null
//     // }
//     return null
//   })
//   const isAuthenticated = Boolean(user)
//   const setUser = useCallback(
//     (user: User | null) => {
//       setUserState(user)
//       localStorage.setItem('user', JSON.stringify(user))
//     },
//     [setUserState]
//   )

//   useEffect(() => {
//     const _user = localStorage.getItem('user')
//     setUserState(_user ? JSON.parse(_user) : null)
//   }, [setUserState])

//   return (
//     <AccountContext.Provider
//       value={{
//         user,
//         setUser,
//         isAuthenticated,
//       }}
//     >
//       {children}
//     </AccountContext.Provider>
//   )
// }
