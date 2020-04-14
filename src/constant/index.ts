export * from './language'

export interface IOption {
  text: string,
  value: string,
}

// 判断是否生产环境
export const isProd = process.env.NODE_ENV === 'production'
