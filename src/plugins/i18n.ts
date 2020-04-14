import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Context } from '@nuxt/types'
import { ILanguageOption } from '~/constant'
import { configKeys } from '~/store/config'
import { makeCrcKey } from 'i18n-abc/lib/shared.js'

Vue.use(VueI18n)

/**
 * vue-i18n
 * @param key
 * @param params 参数
 */
export function $tt (key: string, params?: any): string {
  key = makeCrcKey(key)
  return window.i18n.t(key, params)
}
/**
 * 根据用户提供的language，匹配一下我们支持的language
 * @param acceptLanguage {string} 逗号分隔的字符串
 * @param LanguageOptions {ILanguageOption[]}
 * @param defaultLanguage {string]}
 */
export function matchLanguage (acceptLanguage = '', LanguageOptions: ILanguageOption[], defaultLanguage: string): any {
  const languageList = acceptLanguage.split(',')

  let language = defaultLanguage

  languageList.some((lang: string) => {
    return LanguageOptions.some((option) => {
      if (lang.match(option.matcher)) {
        language = option.value

        return true
      }
      return false
    })
  })

  return language
}

export default async ({ app, store, route }: Context, inject: Function) => {
  const lang = store.getters[configKeys.computedLanguage]
  const translations = await import(`~/locales/${lang.value}.json`)

  app.i18n = new VueI18n({
    locale: lang.value,
    fallbackLocale: 'en',
    messages: {
      [lang.value]: translations,
    }
  })

  // vue-i18n 的 $t 覆盖不了，就只能用 $tt 了先
  inject('tt', $tt)

  window.i18n = app.i18n
}
