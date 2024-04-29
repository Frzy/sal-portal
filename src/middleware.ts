import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export default async function middleware(req: NextRequest): Promise<NextResponse<unknown>> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|images).*)'],
}
