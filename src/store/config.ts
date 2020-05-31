import cookie from 'js-cookie'
import { MutationTree, GetterTree } from 'vuex'


import { LANGUAGE, LanguageOptions } from '~/constant'
import { matchLanguage } from '~/plugins/i18n'
import { prefixStoreKeys } from '~/modules/helper'

import { RootState } from './index'

const keys = {
  // mutations
  setTitle: 'setTitle',
  setLanguage: 'setLanguage',
  // getters
  computedLanguage: 'computedLanguage',
}

export const configKeys = prefixStoreKeys(keys, 'config')

export const state = () => {
  return {
    title: 'Web Auth',
    version: process.env.VERSION,
    language: '',
  }
}

export type ConfigState = ReturnType<typeof state>

export const getters: GetterTree<ConfigState, RootState> = {
  [keys.computedLanguage] (state) {
    const ua = window.navigator.userAgent.match(/Language\/([a-zA-Z-_]+)/)
    const query = window.location.search.match(/[&?]lang=([a-zA-Z-_]+)/)
    const uaLanguage = ua && ua[1]
    const queryLanguage = query && query[1]

    const acceptLanguage = localStorage.getItem('lang') ||
      cookie.get('lang') ||
      state.language ||
      queryLanguage ||
      uaLanguage ||
      window.navigator.language

    const lang = matchLanguage(acceptLanguage, LanguageOptions, LANGUAGE.en)
    return LanguageOptions.find(option => option.value === lang)
  }
}

export const mutations: MutationTree<ConfigState> = {
  [keys.setTitle]: function (state, title): void {
    state.title = title
  },
}
