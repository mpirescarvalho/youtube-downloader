import { Playlist as YtSrPlaylist } from 'youtube-sr'
import ytpl from 'ytpl'
import Channel from './Channel'
import Video from './Video'

export default class Playlist {
  id: string;
  title: string;
  url: string;
  videoCount: number;
  channel: Channel;
  thumbnailUrl: string;
  videos: Video[];
  loaded: boolean

  constructor(source: YtSrPlaylist) {
    this.loaded = false
    mapYtSrPlaylist(this, source)
  }

  async LoadVideos(): Promise<void> {
    const playlist = await ytpl(this.id, { limit: Infinity })
    this.videos = playlist.items.map(item => new Video(item))
  }
}

function mapYtSrPlaylist(target: Playlist, source: YtSrPlaylist) {
  target.id = source.id!
  target.title = source.title!
  target.url = source.url!
  target.videoCount = source.videoCount
  target.thumbnailUrl = source.thumbnail!.url!
  target.channel = new Channel(source.channel!.name!, source.channel!.icon.url!)
}
