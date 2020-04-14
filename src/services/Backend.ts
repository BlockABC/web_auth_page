import axios from 'axios'

export class Backend {
  constructor(
    private _url: string
  ) {}

  public ping () {
    return this.get('/ping')
  }

  protected get (path: string, query: any = null) {
    return axios.get(this._url + path, query)
  }
}
