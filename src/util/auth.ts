import { type NextAuthOptions, type Session, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { getValidatedUser } from '@/lib/users'

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        username: {
          label: 'username',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.password || !credentials?.username) return null

        const validatedUser = await getValidatedUser(credentials)

        if (validatedUser) return validatedUser

        // If you return null then an error will be displayed advising the user to check their details.
        return null
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: token,
      }
    },
    jwt: ({ token, trigger, user, account, profile, session }) => {
      // user is not always defined as stated in the type of nextAuth
      if (trigger === 'signIn') {
        return { ...user }
      } else if (trigger === 'update' && session) {
        return { ...session }
      }

      return token
    },
  },
}

export async function getServerAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}
