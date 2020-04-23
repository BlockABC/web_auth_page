import axios, { AxiosResponse } from 'axios'
import { Consola } from 'consola'
import { ApiError } from '~/error'

import { log } from './log'

export class Backend {
  protected _log: Consola
  protected _backendUrl!: string

  constructor () {
    this._log = log.withTag('WindowMessage')
  }

  init ({ backendUrl }: { backendUrl: string }) {
    log.info('Init Backend ...')
    this._backendUrl = backendUrl
  }

  ping () {
    return this.get('/ping')
  }

  oAuthData ({ key }: { key: string }) {
    return this.get('/api/oauth-data', { key })
  }

  protected async get (path: string, query: any = null) {
    let res: AxiosResponse<any>
    try {
      res = await axios.get(this._backendUrl + path, { params: query })
    }
    catch (err) {
      const error = err.response.data
      throw new ApiError(error.code, error.message)
    }

    if (res.status !== 200) {
      throw new Error('NetworkError:' + res.statusText)
    }

    return res.data
  }
}
