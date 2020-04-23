import { log } from './log'
import { Backend } from './Backend'
import { WindowMessage } from './WindowMessage'

export { default as ckb } from './ckb'
export { log }
export const backend = new Backend()
export const wm = new WindowMessage()
