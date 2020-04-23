import { Context } from '@nuxt/types'

import { backend, wm, log, ckb } from '~/services'
import { messageController } from '~/modules/MessageController'

export default function (ctx: Context, inject: (key: string, value: any) => void) {
  inject('log', log)
  inject('ckb', ckb)

  backend.init({ backendUrl: process.env.backendUrl! })
  inject('backend', backend)

  try {
    wm.init({ ctx, listenOrigin: process.env.dappUrl! })
  }
  catch (err) {
    ctx.error(err.message)
  }
  inject('wm', wm)

  messageController.bind({ ctx, wm })
}
