import { Context } from '@nuxt/types'
import { Consola } from 'consola'
import { CACHE } from '~/constants'
import { WebAuthError } from '~/error'

import { IKeypair, IRequestMessage, IUTXOToParam, IUTXOUnspent } from '~/interface'
import { hasKey, isFunction } from '~/modules/helper'
import { wm, ckb, log } from '~/services'
import { authKeys } from '~/store/auth'

/**
 * MessageController
 *
 * Here we handles all requests sent from web_auth_sdk
 */
export class MessageController {
  protected _log: Consola
  protected _channel = 'default'
  protected _signInWin: Window | null = null

  constructor() {
    this._log = log.withTag('MessageController')
  }

  bind ({ ctx }: { ctx: Context }): void {
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

  ping ({ id }: { id: string }): void {
    wm.response({ id, result: 'pong' })
  }

  async signIn ({ ctx, id }: { ctx: Context, id: string }): Promise<void> {
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

    if (!this._signInWin || this._signInWin.closed) {
      this._log.info(`Start OAuth sign in flow [${id}] ...`)

      ctx.redirect('/loading', { subject: 'signIn' })

      const width = 360
      const height = 600
      const left = window.screenLeft + (window.outerWidth - width) / 2
      const top = window.screenTop + (window.outerHeight - height) / 2
      const features = `left=${left},top=${top},width=${width},height=${height},scrollbars=0,resizable=0`
      this._signInWin = window.open(process.env.baseUrl + '/signin', 'window', features)

      wm.once('confirm-sign-in', async (
        { confirm, keypair, nickname, passwdHash, profile }:
        { confirm: boolean, keypair: IKeypair, nickname: string, passwdHash: string, profile: any }
      ) => {
        if (!confirm) {
          this._log.info(`Cancel sign in flow [${id}] ...`)

          wm.response({ id, error: WebAuthError.fromCode(200) })
        }
        else {
          this._log.info(`Finish sign in flow [${id}] ...`)

          ctx.store.dispatch(authKeys.signIn, { keypair, nickname, passwdHash, profile })

          wm.response({
            id,
            result: {
              address: keypair.address,
              nickname,
              profile,
            }
          })
        }

        ctx.redirect('/')
      })
    }
  }

  signedIn (
    { params }:
    { params: { confirm: boolean, keypair: IKeypair, nickname: string, passwdHash: string, profile: any } }
  ): void {
    wm.emit('confirm-sign-in', params)
  }

  async buildTransaction (
    { ctx, id, params }:
    { ctx: Context, id: string, params:  { tos: IUTXOToParam[] } }
  ): Promise<void> {
    this._log.info(`Start transaction building flow [${id}] ...`)

    // Pass params through storage
    await ctx.app.$localForage.setItem(CACHE.page.buildTransaction, params)

    // Redirect UI to corresponding page
    ctx.redirect('/loading', { subject: 'confirm-building' })

    // Waiting for user's choice
    wm.once('confirm-building', async (
      { confirm, signedTransaction }:
      { confirm: boolean, signedTransaction: RPC.RawTransaction }
    ) => {
      if (!confirm) {
        this._log.info(`Cancel transaction building flow [${id}] ...`)

        wm.response({ id, error: WebAuthError.fromCode(200) })
      }
      else {
        this._log.info(`Confirm transaction building flow [${id}] ...`)

        wm.response({ id, result: { signedTransaction } })
      }
    })
  }

  async signTransaction (
    { ctx, id, params }:
    { ctx: Context, id: string, params: { unspents: IUTXOUnspent, rawTransaction: RPC.RawTransaction } }
  ): Promise<void> {
    this._log.info(`Start transaction signing flow [${id}] ...`)

    // Pass params through storage
    await ctx.app.$localForage.setItem(CACHE.page.signTransaction, params)

    // Redirect UI to corresponding page
    ctx.redirect('/loading', { subject: 'confirm-signing' })


    // Waiting for user's choice
    wm.once('confirm-signing', async ({ confirm }: { confirm: boolean }) => {
      if (!confirm) {
        this._log.info(`Cancel transaction signing flow [${id}] ...`)

        wm.response({ id, error: WebAuthError.fromCode(200) })
      }
      else {
        this._log.info(`Confirm transaction signing flow [${id}] ...`)

        const signedTransaction = ckb.provider.sign({
          transaction: params.rawTransaction,
          unspents: params.unspents,
        })

        wm.response({ id, result: { signedTransaction } })
      }
    })
  }

  async pushTransaction (
    { ctx, id, params }:
    { ctx: Context, id: string, params: { rawTransaction: RPC.RawTransaction } }
  ): Promise<void> {
    this._log.info(`Push transaction flow [${id}] ...`)

    let txId
    try {
      txId = await ckb.provider.pushTransaction({ transaction: params.rawTransaction })
    }
    catch (err) {
      if (err.name === 'RPCError') {
        err.data = null
        wm.response({ id, error: err })
      }
      else {
        wm.response({ id, error: new WebAuthError(300, `Push transaction failed: ${err.message}`) })
      }
    }

    wm.response({ id, result: { txId } })
  }
}

export const messageController = new MessageController()
