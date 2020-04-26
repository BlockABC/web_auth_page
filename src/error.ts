import { CustomError } from 'ts-custom-error'
import { hasKey } from './modules/helper'

export class WebAuthError extends CustomError {
  static readonly messages = {
    100: 'Sign in required.',
    200: 'User rejected request',
  }

  readonly code: number

  constructor (code: number, message: string) {
    super(message)

    this.code = code
  }

  static fromCode (code: number): WebAuthError {
    const message = hasKey(WebAuthError.messages, code) ? WebAuthError.messages[code] : 'Undefined error code'
    return new WebAuthError(code, message)
  }
}

export class ParamError extends CustomError {
  static readonly messages = {
    100: 'Param[{name}] is invalid window object.',
    101: 'Param[{name}] is invalid url.',
    102: 'Param[{name}] is required.',
    999: 'Param[{name}] is still not implemented.'
  }

  readonly name = 'ParamError'
  readonly code: number

  constructor (code: number, message: string) {
    super(message)
    this.code = code
  }

  static fromCode (code: number, paramName: string): ParamError {
    let message = hasKey(ParamError.messages, code) ? ParamError.messages[code] : 'Undefined error code'
    message = message.replace('{name}', paramName)
    return new ParamError(code, message)
  }
}

export class ApiError extends CustomError {
  readonly code: number

  constructor (code: number, message: string) {
    super(message)
    this.code = code
  }
}
