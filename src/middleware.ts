import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOGIN_PATH = '/login'

// This function can be marked `async` if using `await` inside
export default async function middleware(req: NextRequest): Promise<NextResponse<unknown>> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname
  if (!token && path !== LOGIN_PATH) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', req.url)

    return NextResponse.redirect(url)
  }

  if (token && path === LOGIN_PATH) {
    const url = new URL('/', req.url)

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
