import { videoFormat } from 'ytdl-core'

declare module '*.svg'

declare module 'ytdl-core' {
  interface videoFormat {
    extension: videoFormat['container'] | 'mp3'
  }
}
