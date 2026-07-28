import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '@/api/client'
import axios from 'axios'

describe('getErrorMessage', () => {
  it('reads axios API message', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data: { message: 'Invalid email' },
      },
    )
    expect(getErrorMessage(error)).toBe('Invalid email')
  })

  it('falls back for unknown errors', () => {
    expect(getErrorMessage({}, 'fallback')).toBe('fallback')
  })
})
