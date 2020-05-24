import { GetterTree, MutationTree, ActionTree } from 'vuex'
import { CACHE } from '~/constants'
import { IKeypair } from '~/interface'
import { prefixStoreKeys } from '~/modules/helper'
import { RootState } from '~/store/index'

const keys = {
  // getters
  isSignedIn: 'isSignedIn',
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
    passwdHash: '',
    profile: {},
  }
}

export type AuthState = {
  keypair: any | null,
  nickname: string,
  passwdHash: string,
  profile: any,
}

export const getters: GetterTree<AuthState, RootState> = {
  [keys.isSignedIn] (state): boolean {
    return !!(state.nickname && state.keypair)
  }
}

export const mutations: MutationTree<AuthState> = {
  [keys.setAuth] (
    state: AuthState,
    payload?: { keypair: IKeypair, nickname: string, passwdHash: string, canSign: boolean }
  ): void {
    if (!payload) {
      state.keypair = null
      state.nickname = ''
      state.passwdHash = ''
    }
    else {
      state.keypair = payload.keypair
      state.nickname = payload.nickname
      state.passwdHash = payload.passwdHash
    }
  },
  [keys.setProfile] (state: AuthState, payload?: any): void {
    state.profile = payload ?? {}
  },
}

export const actions: ActionTree<AuthState, RootState> = {
  async [keys.signIn] (
    ctx,
    { keypair, nickname, passwdHash, profile }: { keypair: IKeypair, nickname: string, passwdHash: string, profile: any }
  ) {
    // Cache sensitive information in development
    if (!process.env.PROD) {
      await Promise.all([
        this.$localForage.setItem(CACHE.ckb.keypair, keypair),
        this.$localForage.setItem(CACHE.ckb.nickname, nickname),
        this.$localForage.setItem(CACHE.ckb.passwdHash, passwdHash),
        this.$localForage.setItem(CACHE.ckb.profile, profile),
      ])
    }

    this.$ckb.provider.setKeypairs({ keypairs: [keypair] })

    ctx.commit(keys.setAuth, { keypair, nickname, passwdHash })
    ctx.commit(keys.setProfile, profile)

    return { address: keypair.address, nickname, profile }
  },
  async [keys.signInWithCache] (ctx) {
    // Only allow in development
    if (process.env.PROD) {
      return
    }

    // Read authorization info from cache
    const [keypair, nickname, passwdHash, profile]  = await Promise.all([
      this.$localForage.getItem(CACHE.ckb.keypair),
      this.$localForage.getItem(CACHE.ckb.nickname),
      this.$localForage.getItem(CACHE.ckb.passwdHash),
      this.$localForage.getItem(CACHE.ckb.profile),
    ])

    if (!keypair) {
      return null
    }

    this.$ckb.provider.setKeypairs({ keypairs: [keypair] })

    ctx.commit(keys.setAuth, { keypair, nickname, passwdHash })
    ctx.commit(keys.setProfile, profile)

    return { keypair, nickname, profile }
  },
  async [keys.signOut] (ctx) {
    await Promise.all([
      this.$localForage.removeItem(CACHE.ckb.keypair),
      this.$localForage.removeItem(CACHE.ckb.nickname),
      this.$localForage.removeItem(CACHE.ckb.passwdHash),
      this.$localForage.removeItem(CACHE.ckb.profile),
    ])

    this.$ckb.provider.setKeypairs({ keypairs: [] })

    ctx.commit(keys.setAuth)
    ctx.commit(keys.setProfile)
  }
}
