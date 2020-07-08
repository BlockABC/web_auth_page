import { Backend } from './Backend'
import { WindowMessage } from './WindowMessage'

export { log } from './log'
export { default as ckb } from './ckb'
export const backend = new Backend()
export const wm = new WindowMessage()
