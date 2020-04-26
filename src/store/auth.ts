import { MutationTree, ActionTree } from 'vuex'
import { CACHE } from '~/constants'
import { IKeypair } from '~/interface'
import { prefixStoreKeys } from '~/modules/helper'
import { RootState } from '~/store/index'

const keys = {
  // states
  keypair: 'keypair',
  nickname: 'nickname',
  profile: 'profile',
  // mutations
  setAuth: 'setAuth',
  setProfile: 'setProfile',
  // actions
  signIn: 'signIn',
  signInWithCache: 'signInWithCache',
  signOut: 'signOut',
}

export const authKeys = prefixStoreKeys(keys, 'auth')

export const state = (): AuthState => {
  return {
    keypair: null,
    nickname: '',
    profile: {},
  }
}

export type AuthState = {
  keypair: any | null,
  nickname: '',
  profile: any,
}

export const mutations: MutationTree<AuthState> = {
  [keys.setAuth] (
    state: AuthState,
    payload?: { keypair: IKeypair, nickname: string, canSign: boolean }
  ): void {
    if (!payload) {
      state.keypair = null
      state.nickname = ''
    }
    else {
      state.keypair = payload.keypair
      state.nickname = payload.nickname
    }
  },
  [keys.setProfile] (state: AuthState, payload?: any): void {
    state.profile = payload ?? {}
  },
}

export const actions: ActionTree<AuthState, RootState> = {
  async [keys.signIn] (
    ctx,
    { keypair, nickname, profile }: { keypair: IKeypair, nickname: string, profile: any }
  ) {
    // Cache insensitive information in development
    if (!process.env.PROD) {
      await Promise.all([
        this.$localForage.setItem(CACHE.ckb.keypair, keypair),
        this.$localForage.setItem(CACHE.ckb.nickname, nickname),
        this.$localForage.setItem(CACHE.ckb.profile, profile),
      ])
    }

    this.$ckb.provider.setKeypairs({ keypairs: [keypair] })

    ctx.commit(keys.setAuth, { keypair, nickname })
    ctx.commit(keys.setProfile, profile)

    return { address: keypair.address, nickname, profile }
  },
  async [keys.signInWithCache] (ctx) {
    // Only allow in development
    if (process.env.PROD) {
      return
    }

    // Read authorization info from cache
    const [keypair, nickname, profile]  = await Promise.all([
      this.$localForage.getItem(CACHE.ckb.keypair),
      this.$localForage.getItem(CACHE.ckb.nickname),
      this.$localForage.getItem(CACHE.ckb.profile),
    ])

    this.$ckb.provider.setKeypairs({ keypairs: [keypair] })

    if (!keypair) {
      return null
    }

    ctx.commit(keys.setAuth, { keypair, nickname })
    ctx.commit(keys.setProfile, profile)

    return { keypair, nickname, profile }
  },
  async [keys.signOut] (ctx) {
    await Promise.all([
      this.$localForage.removeItem(CACHE.ckb.keypair),
      this.$localForage.removeItem(CACHE.ckb.nickname),
      this.$localForage.removeItem(CACHE.ckb.profile),
    ])

    this.$ckb.provider.setKeypairs({ keypairs: [] })

    ctx.commit(keys.setAuth)
    ctx.commit(keys.setProfile)
  }
}
