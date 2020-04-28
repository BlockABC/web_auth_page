export interface IResponseTask {
  createdAt: Date,
  message: IRequestMessage,
  source: Window,
}

export interface IRequestTask {
  createdAt: Date,
  message: IRequestMessage,
  reject: Function,
  resolve: Function,
}

export interface IRequestMessage {
  channel: string,
  id: string,
  method: string,
  params: any,
}

export interface INotifyMessage {
  channel: string,
  method: string,
  params: any,
}

export interface IResponseMessage {
  channel: string,
  error?: IError,
  id: string,
  result?: any,
}

export interface IError {
  code: number,
  data: any | null,
  message: string,
}

export interface IKeypair {
  address: string,
  privateKey: string,
  publicKey: string,
  wif: string,
}

export interface IUTXOToParam {
  address: string,
  value: string,
}

export interface IUTXOUnspent {
  address: string,
  lock?: any,
  lockHash?: string,
  txId: string,
  value: any,
  vout: number,
}

export type IUTXOInput = IUTXOUnspent

export interface IUTXOOutput {
  address: string,
  asm?: string,
  type?: string,
  value: any,
}
