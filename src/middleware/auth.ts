
import { Context } from '@nuxt/types'

export default ({ app, store }: Context) => {
  if (!store.getters["auth/isSignedIn"]) {
    app.$log.info(`Unsigned in, redirect to route[/].`)
    app.router!.replace('/')
  }
}
