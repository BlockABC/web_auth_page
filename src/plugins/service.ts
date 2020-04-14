import { Context } from '@nuxt/types'
import {
  backend
} from '~/services'

export default function ({ store }: Context, inject: (key: string, value: any) => void) {
  inject('backend', backend)
}
