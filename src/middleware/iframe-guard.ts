
import { Context } from '@nuxt/types'

export default ({ app, store }: Context) => {
  if (window !== window.parent) {
    app.$log.error('This page can not run in iframe, redirect to route[/].')
    app.router!.replace('/')
  }
}
