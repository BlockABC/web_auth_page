import { WindowMessage } from '../WindowMessage'

jest.mock('../WindowMessage')

export const log = jest.requireActual('~/services/log').log
export const ckb = {
  provider: {
    pushTransaction: jest.fn(() => 'id_of_transaction')
  }
}
export const backend = {}
export const wm = new WindowMessage()
