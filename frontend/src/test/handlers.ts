import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:4000/api/health', () =>
    HttpResponse.json({ status: 'ok' }),
  ),
]
