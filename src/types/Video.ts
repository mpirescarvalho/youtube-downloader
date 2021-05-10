import { Video as YtSrVideo } from 'youtube-sr'
import { Item as YtplVideo } from 'ytpl'
import Channel from './Channel'

export default class Video {
  id: string
  title: string
  description?: string
  durationFormatted: string
  duration: number
  uploadedAt?: string
  views: number
  url: string
  thumbnailUrl?: string
  channel: Channel

  constructor(source: YtSrVideo | YtplVideo) {
    if (source instanceof YtSrVideo) {
      mapYtSrVideo(this, source)
    } else {
      mapYtplVideo(this, source)
    }
  }
}

function mapYtSrVideo(target: Video, source: YtSrVideo) {
  target.id = source.id!
  target.title = source.title!
  target.description = source.description
  target.durationFormatted = source.durationFormatted
  target.duration = source.duration
  target.uploadedAt = source.uploadedAt
  target.views = source.views
  target.url = source.url
  target.thumbnailUrl = source.thumbnail?.url
  target.channel = new Channel(source.channel!.name!, source.channel!.icon.url!)
}

function mapYtplVideo(target: Video, source: YtplVideo) {
  target.id = source.id
  target.title = source.title
  target.description = ''
  target.durationFormatted = source.duration || '00:00'
  target.duration = source.durationSec || 0
  target.uploadedAt = undefined
  target.views = 0
  target.url = source.url
  target.thumbnailUrl = source.bestThumbnail.url || undefined
  target.channel = new Channel(source.author.name)
}
