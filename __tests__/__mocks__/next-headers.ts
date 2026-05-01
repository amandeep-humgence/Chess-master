// Mock for next/headers used in API route tests
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}

export const cookies = jest.fn(() => Promise.resolve(mockCookieStore))
export const _mockCookieStore = mockCookieStore
