import { ConfigState } from './config'
import { AuthState } from './auth'

export type RootState = {
  config: ConfigState,
  auth: AuthState,
}
