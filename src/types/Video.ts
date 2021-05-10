import { Video as YtSrVideo } from 'youtube-sr'
import Channel from './Channel'

export default class Video {
  id: string
  title: string
  description: string
  durationFormatted: string
  duration: number
  uploadedAt: string
  views: number
  url: string
  thumbnailUrl?: string
  channel: Channel

  constructor(source: YtSrVideo) {
    mapYtSrVideo(this, source)
  }
}

function mapYtSrVideo(target: Video, source: YtSrVideo) {
  target.id = source.id!
  target.title = source.title!
  target.description = source.description!
  target.durationFormatted = source.durationFormatted
  target.duration = source.duration
  target.uploadedAt = source.uploadedAt!
  target.views = source.views
  target.url = source.url
  target.thumbnailUrl = source.thumbnail?.url
  target.channel = new Channel(source.channel!.name!, source.channel!.icon.url!)
}
