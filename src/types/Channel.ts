export default class Channel {
  name: string
  thumbnailUrl?: string

  constructor(name: string, thumbnailUrl?: string) {
    this.name = name
    this.thumbnailUrl = thumbnailUrl
  }
}
