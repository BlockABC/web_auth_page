import '@nervosnetwork/ckb-sdk-rpc'

declare var onechain: any;

declare module 'vuex/types/vue' {
  interface Store<S> {
    $localForage: any
  }
}
