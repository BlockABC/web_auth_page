import createHash from 'create-hash'
import { pbkdf2 } from 'pbkdf2'

import { ParamError } from '~/error'
import { IError, INotifyMessage, IRequestMessage, IResponseMessage, IUTXOInput, IUTXOOutput } from '~/interface'

export function assertNotNil (name: string, val: any): void {
  if (!val) {
    throw ParamError.fromCode(102, name)
  }
}

export function isNumber (val: any): val is number {
  return typeof val === 'number'
}

export function isString (val: any): val is string {
  return typeof val === 'string'
}

export function isFunction (val: any): val is Function {
  return val && (
    val instanceof Function ||
    {}.toString.call(val) === '[object Function]' ||
    (val.constructor && val.call && val.apply)
  )
}

export function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj
}

export function isRequestMessage (val: any): val is IRequestMessage {
  return !!(val.channel && val.id && val.method && val.hasOwnProperty('params'))
}

export function isNotifyMessage (val: any): val is INotifyMessage {
  return !!(val.channel && val.method && val.hasOwnProperty('params') && !val.hasOwnProperty('id'))
}

export function isResponseMessage (val: any): val is IResponseMessage {
  let ret = false
  if (val.hasOwnProperty('result')) {
    ret = true
  }
  else if (val.hasOwnProperty('error') && isError(val.error)) {
    ret = true
  }

  return !!(val.channel && val.id && ret)
}

export function isError (val: any): val is IError {
  return !!(val.code && val.hasOwnProperty('message') && val.hasOwnProperty('data'))
}

export function isMessage (val: any): boolean {
  return isNotifyMessage(val) || isRequestMessage(val) || isResponseMessage(val)
}

export function isWindow (val: any): boolean {
  return val && val.hasOwnProperty('postMessage')
}

export function isValidUrl (val: any): boolean {
  try {
    new URL(val)
    return true
  }
  catch {
    return false
  }
}

/**
 * SHA-256
 *
 * @param {string | Buffer} data
 * @param {'utf8' | 'hex' | 'base64'} encoding
 * @return {string | Buffer}
 */
export function sha256 (data: string | Buffer, encoding: createHash.encoding = 'hex'): string | Buffer {
  const hash = createHash('sha256')
  hash.update(data)
  return hash.digest(encoding)
}

/**
 * Derive private key with PBKDF2
 *
 * @param {string | Buffer} openId
 * @param {string | Buffer} password
 * @param {'utf8' | 'hex' | 'base64'} encoding
 * @return {Promise<string | Buffer>}
 */
export function derivePrivateKey (
  openId: string | Buffer,
  password: string | Buffer,
  encoding: createHash.encoding = 'hex'
): Promise<string | Buffer> {
  return new Promise((resolve, reject) => {
    pbkdf2(openId, password, 1e5, 32, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err)
      }

      resolve(derivedKey.toString(encoding))
    })
  })
}

/**
 * Prefix keys in modules of store with namespace
 *
 * @param {T} keys
 * @param {string} prefix
 * @return {T}
 */
export function prefixStoreKeys<T> (keys: T, prefix: string): T {
  const ret: any = {}

  for (const key in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, key)) continue

    ret[key] = `${prefix}/${keys[key]}`
  }

  return ret
}

/**
 * Find out unique addresses from inputs/outputs
 *
 * @param {IUTXOInput[] | IUTXOOutput[]} arr
 * @return {string[]}
 */
export function uniqAddresses (arr: IUTXOInput[] | IUTXOOutput[]): string[] {
  const existed: string[] = []
  arr.forEach((item: IUTXOInput | IUTXOOutput): void => {
    if (existed.includes(item.address)) {
      return
    }

    existed.push(item.address)
  })

  return existed
}

/**
 * Select text in element
 *
 * @param {Element} el
 */
export function select (el: Element): void {
  const range = document.createRange()
  range.selectNode(el)
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
