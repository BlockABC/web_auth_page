let winSpy: jest.SpyInstance
export function mockWindow () {
  const mock = {
    origin: 'http://unittest',
    addEventListener: jest.fn(),
    open: jest.fn(),
    postMessage: jest.fn(),
  }

  // @ts-ignore
  winSpy = jest.spyOn(global, 'window', 'get')
  winSpy.mockImplementation(() => mock)
}

export function restoreWindow () {
  winSpy.mockRestore()
}

export const ctx: any = {
  redirect: jest.fn(),
  app: {
    $localForage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }
  }
}
