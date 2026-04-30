import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, data, message }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

export function handleError(err: unknown) {
  const message = (err as Error).message
  if (message === 'UNAUTHORIZED') return errorResponse('Unauthorized — please log in', 401)
  if (message === 'FORBIDDEN') return errorResponse('Forbidden — admin access required', 403)
  return errorResponse(message)
}
