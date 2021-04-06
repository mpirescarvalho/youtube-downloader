export default class DownloadAbortError extends Error {
  constructor() {
    super('Canceled by the user')
    this.name = 'DownloadAbortError'
  }
}
