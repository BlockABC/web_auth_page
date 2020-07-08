import { CACHE, WM_EVENTS } from '~/constants'
import { wm, ckb } from '~/services'
import { MessageController } from '~/modules/MessageController'
import { ctx } from '../mocks'

jest.mock('~/services')
window.open = jest.fn()

describe('MessageController', () => {
  let constroller: MessageController

  beforeEach(() => {
    constroller = new MessageController()
  })

  describe('bind', () => {
    it('should listen on all message from chnnel', () => {
      constroller.bind({ ctx })
      expect(wm.on).toBeCalled()
    })
  })

  describe('ping', () => {
    it('should response pong', () => {
      constroller.ping({ id: '1' })
      expect(wm.response).toBeCalledWith({ id: '1', result: 'pong' })
    })
  })

  describe('signIn', () => {
    (process.env as any).PROD = true

    it(`should open window and wait for response correctly`, () => {
      constroller.signIn({ ctx, id: '1' })

      expect(window.open).toBeCalled()
      expect(wm.once).toBeCalledWith(WM_EVENTS.confirmSignIn, expect.any(Function))
    })
  })

  describe('signedIn', () => {
    it(`should trigger ${WM_EVENTS.confirmSignIn} event`, () => {
      const params: any = {}
      constroller.signedIn({ params })

      expect(wm.emit).toBeCalledWith(WM_EVENTS.confirmSignIn, params)
    })
  })

  describe('buildTransaction', () => {
    it(`should pass params and wait for response correctly`, async () => {
      const params: any = {}
      await constroller.buildTransaction({ ctx, id: '1', params })

      expect(ctx.app.$localForage.setItem).toBeCalledWith(CACHE.page.buildTransaction, params)
      expect(wm.once).toBeCalledWith(WM_EVENTS.confirmBuilding, expect.any(Function))
    })
  })

  describe('signTransaction', () => {
    it(`should pass params and wait for response correctly`, async () => {
      const params: any = {}
      await constroller.signTransaction({ ctx, id: '1', params })

      expect(ctx.app.$localForage.setItem).toBeCalledWith(CACHE.page.signTransaction, params)
      expect(wm.once).toBeCalledWith(WM_EVENTS.confirmSigning, expect.any(Function))
    })
  })

  describe('pushTransaction', () => {
    it(`should push transaction and response transaction ID`, async () => {
      const params: any = { rawTransaction: '' }
      await constroller.pushTransaction({ ctx, id: '1', params })

      expect(ckb.provider.pushTransaction).toBeCalled()
      expect(wm.response).toBeCalledWith({
        id: '1',
        result: { txId: 'id_of_transaction' },
      })
    })
  })
})
