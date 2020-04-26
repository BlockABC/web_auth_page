import { NuxtAppOptions } from '@nuxt/types/app'
import VueRouter from 'vue-router'

declare var onechain: any;

declare module 'vuex/types/index' {
  interface Store<S> {
    app: NuxtAppOptions
    $router: VueRouter
    $localForage: any
    $ckb: any
  }
}
