import { Backend } from './Backend'

export const backend = new Backend(process.env.backendUrl!)
