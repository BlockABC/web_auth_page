import { Context } from '@nuxt/types'
import { Consola } from 'consola'
import { CACHE } from '~/constants'

import { IKeypair, IRequestMessage } from '~/interface'
import { hasKey, isFunction } from '~/modules/helper'
import { log } from '~/services'
import { WindowMessage } from '~/services/WindowMessage'
import { authKeys } from '~/store/auth'

/**
 * MessageController
 *
 * Here we handles all requests sent from web_auth_sdk
 */
export class MessageController {
  protected _log: Consola
  protected _channel = 'default'

  constructor() {
    this._log = log.withTag('MessageController')
  }

  bind ({ ctx, wm }: { ctx: Context, wm: WindowMessage }): void {
    wm.on(`${this._channel}:*`, (message: IRequestMessage) => {
      const method = message.method
      if (method === 'bind') {
        this._log.warn('Method [bind] can not be requested, it is reserved.')
      }
      if (!hasKey(this, method)) {
        this._log.warn(`Method [${method}] can not be requested, it is not exist.`)
      }
      else {
        const fn = this[method]
        if (isFunction(fn)) {
          fn.call(this, { ctx, wm, ...message })
        }
      }
    })
  }

  ping ({ wm, id }: { wm: WindowMessage, id: string }): void {
    wm.response({ id, result: 'pong' })
  }

  async signIn ({ ctx, wm, id, params }: { ctx: Context, wm: WindowMessage, id: string, params: any }): Promise<void> {
    if (!process.env.PROD) {
      const cache = await ctx.store.dispatch(authKeys.signInWithCache)
      if (cache) {
        this._log.warn(`Resume sign in status from cache.`)

        wm.response({ id, result: {
            address: cache.keypair.address,
            nickname: cache.nickname,
            profile: cache.profile,
          }
        })

        return
      }
    }

    this._log.info(`Start OAuth sign in flow [${id}] ...`)

    ctx.redirect('/loading', { subject: 'signIn' })
    window.open(process.env.baseUrl + '/signin')

    wm.once('signed', async (
      { keypair, nickname, profile }:
      { keypair: IKeypair, nickname: string, profile: any }
    ) => {
      this._log.info(`Finish sign in flow [${id}] ...`)

      ctx.app.$ckb.provider.setKeypairs({keypairs: [keypair]})

      ctx.store.dispatch(authKeys.signIn, { keypair, nickname, profile })

      wm.response({
        id,
        result: {
          address: keypair.address,
          nickname,
          profile,
        }
      })
    })
  }

  signedIn (
    { ctx, wm, params }:
    { ctx: Context, wm: WindowMessage, params: { keypair: IKeypair, nickname: string, profile: any } }
  ): void {
    wm.emit('signed', params)
  }

  async buildTransaction (
    { ctx, wm, id, params }:
    { ctx: Context, wm: WindowMessage, id: string, params: any }
  ): Promise<void> {
    this._log.info(`Start transaction building flow [${id}] ...`)

    await ctx.app.$localForage.setItem(CACHE.page.buildTransaction, params)
    ctx.redirect('/build-transaction')

    wm.once('transaction-built', async (params: { rawTx: RPC.RawTransaction }) => {
      this._log.info(`Finish transaction building flow [${id}] ...`)

      console.log(params)

      wm.response({
        id,
        result: {
          signedTransaction: params.rawTx,
        }
      })
    })
  }
}

export const messageController = new MessageController()
