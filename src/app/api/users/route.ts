import { createUsers, getUsers } from '@/lib/users'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const users = await getUsers()

  return Response.json(users)
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const payload = (await request.json()) as User.CreatePayload

  try {
    const response = await createUsers(payload)

    return Response.json({ response }, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
