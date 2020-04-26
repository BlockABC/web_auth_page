import { Consola } from 'consola'
import EventEmitter from 'eventemitter3'
import { Context } from '@nuxt/types'

import { INotifyMessage, IRequestTask, IResponseMessage, IResponseTask } from '~/interface'
import { ParamError } from '~/error'
import {
  assertNotNil,
  isMessage,
  isNotifyMessage,
  isRequestMessage,
  isResponseMessage,
  isValidUrl,
} from '~/modules/helper'
import { log } from './log'

export class WindowMessage extends EventEmitter {
  protected _ctx!: Context

  protected _defaultChannel = 'default'
  // ID of request messages
  protected _id: number
  protected _log: Consola
  // received requests need response
  protected _needToResponse: Map<string, IResponseTask>
  protected _listenOrigin?: string
  // Tasks need to be cleaned up on a regular basis.
  // sent out requests wait for response
  protected _waitForResponse: Map<string, IRequestTask>
  // window
  protected _win?: Window
  // Timer ID of timeout task cleaner
  protected _cleanTimerId: any
  // Timeout limit for tasks' waiting for a response, default is 5 minutes
  protected _timeout = 30000

  constructor () {
    super()

    this._id = 1
    this._needToResponse = new Map()
    this._waitForResponse = new Map()
    this._log = log.withTag('WindowMessage')

    window.addEventListener('message', this._listen.bind(this))

    this._cleanTimerId = setInterval(this._cleanTimeoutTask.bind(this), 5000)
  }

  init ({ ctx, listenOrigin }: { ctx: Context, listenOrigin: string }): void {
    if (!isValidUrl(listenOrigin)) {
      throw ParamError.fromCode(101, 'targetOrigin')
    }

    this._log.info('Init WindowMessage ...')
    this._ctx = ctx

    // Check if window is in iframe
    let inIframe: boolean
    try {
      inIframe = window.self !== window.top;
    }
    catch {
      inIframe = true
    }

    // If opened by self, only communicate with self
    if (window.opener && window.opener.origin === window.origin) {
      this._log.info('Set opener as message target.')
      this._win = window.opener
      this._listenOrigin = window.opener.origin
    }
    // If embedded as iframe, communicate with parent
    else if (inIframe) {
      this._log.info('Set parent as message target.')
      this._win = window.parent
      this._listenOrigin = this._cleanOrigin(listenOrigin)
    }
    else {
      throw new Error('Web Auth Page must be embedded in an iframe.')
    }
  }

  notify (
    { channel, method, params = null }:
    { channel?: string, method: string, params?: any }
  ) {
    assertNotNil('method', method)
    channel = channel ?? this._defaultChannel

    const message: INotifyMessage = {
      channel,
      method,
      params,
    }

    this._log.info(`Notify ${this._listenOrigin}.`)
    this._log.debug(`Notify content:`, message)
    this._win!.postMessage(message, this._listenOrigin!)
    window.postMessage(message, '*')
  }

  response (
    { channel, id, result = null, error = null }:
    { channel?: string, id: string, result?: any, error?: any }
  ): void {
    assertNotNil('id', id)
    channel = channel ?? this._defaultChannel

    const key = `${channel}-${id}`
    const task = this._needToResponse.get(key)

    if (!task) {
      this._log.warn(`Can not find request [${key}], skip response.`)
      return
    }

    let message: IResponseMessage
    if (result) {
      message = { channel, id, result }
    }
    else if (error) {
      message = { channel, id, error }
    }
    else {
      throw new Error(`Response must contain result or error, but both is nil.`)
    }

    this._log.info(`Response ${this._listenOrigin}.`)
    this._log.debug(`Response content:`, message)
    task.source.postMessage(message, this._listenOrigin!)
    this._needToResponse.delete(key)
  }

  /**
   * Format and unify origin
   *
   * @param {string} origin
   * @returns {string}
   */
  protected _cleanOrigin (origin: string) {
    let url
    try {
      url = new URL(origin)
    }
    catch (err) {
      return ''
    }

    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1'
    }

    return url.toString().slice(0, -1)
  }

  /**
   * Clean up timeout tasks in a regular basis
   */
  protected _cleanTimeoutTask () {
    this._log.trace(`Start cleaning timeout request`)
    const now = new Date()
    for (let [key, val] of this._waitForResponse.entries()) {
      if (now.getTime() - val.createdAt.getTime() > this._timeout) {
        this._waitForResponse.delete(key)

        this._log.warn(`Delete timeout task ${key}`)
        this._log.debug(`Delete timeout task ${key}`, val.message)
      }
    }
  }

  /**
   * Handle message sent to current window
   *
   * @param {Event} e
   */
  protected _listen (e: MessageEvent): void {
    // Skip message created by vue-devtools
    if (
      (e.data.source && typeof e.data.source === 'string' && e.data.source.startsWith('vue-devtools')) ||
      e.data.hasOwnProperty('devtoolsEnabled')
    ) {
      return
    }

    this._log.info(`Received message from: ${e.origin}`)
    this._log.debug(`Message content:`, e.data)

    // skip empty message
    if (!isMessage(e.data)) {
      this._log.warn(`Skip message because its structure is invalid.`)
      return
    }
    // skip message from invalid page
    else if (![this._listenOrigin, window.location.origin].includes(this._cleanOrigin(e.origin))) {
      this._log.warn(`Skip message because its origin is invalid.`)
      return
    }

    const message = e.data
    const event = `${message.channel}:*`
    if (isNotifyMessage(message)) {
      this.emit(event, message)
    }
    else if (isRequestMessage(message)) {
      this._needToResponse.set(`${message.channel}-${message.id}`, {
        createdAt: new Date(),
        source: (e.source as Window),
        message,
      })

      this.emit(event, message)
    }
    else if (isResponseMessage(message)) {
      const key = `${message.channel}-${message.id}`
      const task = this._waitForResponse.get(key)
      if (!task) {
        this._log.warn(`Skip message because task can not be found.`)
        return
      }

      if (message.result) {
        this._log.debug(`Resolve task: ${key}`)
        task.resolve(message.result)
      }
      else {
        this._log.debug(`Reject task: ${key}`)
        task.reject(message.error)
      }
    }
    else {
      this._log.warn(`Skip message because origin is invalid.`)
    }
  }
}
