import { WindowMessage } from '~/services/WindowMessage'
import { ctx, mockWindow, restoreWindow } from '../mocks'

describe('WindowMessage', () => {
  let wm: WindowMessage

  beforeEach(() => {
    mockWindow()

    wm = new WindowMessage()
    wm.init({ ctx, listenOrigin: window.origin })
  })

  afterEach(() => {
    restoreWindow()
  })

  describe('notify', () => {
    it('should send notify through window.postMessage', () => {
      const message = { channel: 'unittest', method: 'unittest', params: { a: 123, b: true } }
      wm.notify(message)

      expect(window.postMessage).toBeCalledWith(message, window.origin)
    })
  })

  describe('request', () => {
    it('should send request through window.postMessage', () => {
      const message = { channel: 'unittest', method: 'unittest', params: { a: 123, b: true } }
      wm.request(message)

      expect(window.postMessage).toBeCalledWith(Object.assign(message, { id: '1' }), window.origin)
    })
  })

  describe('response', () => {
    it('should support response result through window.postMessage', () => {
      const map = new Map()
      map.set('unittest-1', {
        createdAt: new Date(),
        message: {},
        source: window,
      })
      Reflect.defineProperty(wm, '_needToResponse', { value: map })

      const message = { channel: 'unittest', id: '1', result: {}, error: null }
      wm.response(message)

      delete message.error
      expect(window.postMessage).toBeCalledWith(message, window.origin)
    })

    it('should support response error through window.postMessage', () => {
      const map = new Map()
      map.set('unittest-1', {
        createdAt: new Date(),
        message: {},
        source: window,
      })
      Reflect.defineProperty(wm, '_needToResponse', { value: map })

      const error = { code: 1, data: null, message: 'unittest-error' }
      const message = { channel: 'unittest', id: '1', result: null, error }
      wm.response(message)

      delete message.result
      expect(window.postMessage).toBeCalledWith(message, window.origin)
    })
  })
})
