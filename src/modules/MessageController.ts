import { Context } from '@nuxt/types'
import { Consola } from 'consola'

import { IRequestMessage } from '~/interface'
import { hasKey, isFunction } from '~/modules/helper'
import { log } from '~/services'
import { WindowMessage } from '~/services/WindowMessage'

/**
 * MessageController
 *
 * Here we handles all requests sent from web_auth_sdk
 */
export class MessageController {
  // TODO figure out a better way to pass this ID
  protected _signInID: string | null
  protected _log: Consola
  protected _channel = 'default'

  constructor() {
    this._signInID = null
    this._log = log.withTag('MessageController')
  }

  bind ({ ctx, wm }: { ctx: Context, wm: WindowMessage }) {
    wm.on(`${this._channel}:*`, (message: IRequestMessage) => {
      const method = message.method
      if (method !== 'bind' && hasKey(this, method)) {
        const fn = this[method]
        if (isFunction(fn)) {
          fn.call(this, { ctx, wm, ...message })
        }
      }
    })
  }

  ping ({ wm, id }: { wm: WindowMessage, id: string }) {
    wm.response({ id, result: 'pong' })
  }

  async signIn ({ ctx, wm, id, params }: { ctx: Context, wm: WindowMessage, id: string, params: any }) {
    const address = await ctx.app.$localForage.getItem('ckb.address')
    // If dapp only need user profile and cache exists, return the cache directly.
    if (!params.readyForSign && address) {
      this._log.info(`Resume sign in status from cache.`)

      const [address, nickname, profile]  = await Promise.all([
        ctx.app.$localForage.getItem('ckb.address'),
        ctx.app.$localForage.getItem('ckb.nickname'),
        ctx.app.$localForage.getItem('ckb.profile'),
      ])

      wm.response({
        id,
        result: {
          address,
          nickname,
          profile,
        }
      })
    }
    // If dapp needs user to sign something or cache does not exist, open new window for OAuth authentication.
    else {
      this._log.info(`Start OAuth sign in flow [${id}] ...`)

      ctx.redirect('/loading', { subject: 'signIn' })
      this._signInID = id
      window.open(process.env.baseUrl + '/signin')
    }
  }

  async signedIn ({ ctx, wm, params }: { ctx: Context, wm: WindowMessage, params: any }) {
    if (this._signInID) {
      this._log.info(`Finish sign in flow [${signInID}] ...`)

      const { keypair, nickname, profile } = params
      ctx.app.$ckb.provider.setKeypairs({
        keypairs: [keypair]
      })

      // Cache insensitive information
      await Promise.all([
        ctx.app.$localForage.setItem('ckb.address', keypair.address),
        ctx.app.$localForage.setItem('ckb.nickname', nickname),
        ctx.app.$localForage.setItem('ckb.profile', profile),
      ])

      wm.response({
        id: this._signInID,
        result: {
          address: keypair.address,
          nickname,
          profile,
        }
      })

      this._signInID = null
    }
  }
}

export const messageController = new MessageController()
