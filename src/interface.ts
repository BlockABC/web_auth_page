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
  error?: IError
  id: string,
  result?: any,
}

export interface IError {
  code: number,
  data: any | null
  message: string,
}
