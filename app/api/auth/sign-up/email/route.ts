import { auth } from '@/lib/auth/server'

export async function POST(request: Request) {
  console.log(request)

  return new Response(JSON.stringify({}), {
    status: 201,
  })
}