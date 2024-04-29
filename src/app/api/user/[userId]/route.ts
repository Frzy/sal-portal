import { deleteUser, findUser, updateUser } from '@/lib/users'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
): Promise<Response> {
  const { userId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const user = await findUser((u) => u.id === userId)

  if (!user) return Response.json({ message: 'User not found' }, { status: 404 })

  return Response.json(user)
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } },
): Promise<Response> {
  const { userId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin || session.user.id !== userId)
    return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const payload = (await request.json()) as User.UpdatePayload

  try {
    const updatedUser = updateUser(payload)

    if (!updateUser) return Response.json({ message: 'Member not Found' }, { status: 404 })

    return Response.json(updatedUser)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } },
): Promise<Response> {
  const { userId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  await deleteUser(userId)

  return Response.json({})
}
