import axios from 'axios'
import { Backend } from '~/services/Backend'

jest.mock('axios', () => {
  return {
    get: jest.fn(() => {
      return {
        status: 200,
        data: {},
      }
    })
  }
})

describe('Backend', () => {
  let backend: Backend
  const backendUrl = 'https://unittest'

  beforeEach(() => {
    backend = new Backend()
    backend.init({ backendUrl })
  })

  describe('ping', () => {
    it('should call axios get to send request', async () => {
      await backend.ping()

      expect(axios.get).toBeCalledWith(backendUrl + '/ping', { params: null })
    })
  })

  describe('/api/oauth-data', () => {
    it('should call axios get to send request', async () => {
      await backend.ping()

      expect(axios.get).toBeCalledWith(backendUrl + '/ping', { params: null })
    })
  })
})
