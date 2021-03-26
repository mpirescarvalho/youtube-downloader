import ytdl, { videoFormat } from 'ytdl-core'
import { Video } from 'youtube-sr'
import path from 'path'
import os from 'os'
import fs from 'fs'

import { DownloadProgress } from '../contexts/download'

export async function downloadVideo(
  video: Video,
  format: videoFormat,
  progressCallback: (progress: DownloadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.homedir(), 'Desktop')
    const stream = ytdl(video.url!, { format })
    stream.pipe(
      fs.createWriteStream(path.resolve(outputPath, `${video.title}.mp4`))
    )

    const currentProgress = {
      complete: false,
      percent: 0,
      downloaded: 0,
      total: 0,
      time: 0,
      timeLeft: 0
    }

    progressCallback(Object.assign({}, currentProgress))

    let starttime = Date.now()
    stream.once('response', () => {
      starttime = Date.now()
    })

    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total
      const downloadedSeconds = (Date.now() - starttime) / 1000
      const estimatedDownloadTime =
        downloadedSeconds / percent - downloadedSeconds

      Object.assign(currentProgress, {
        complete: percent === 1,
        percent,
        downloaded,
        total,
        time: downloadedSeconds,
        timeLeft: estimatedDownloadTime
      })

      progressCallback(Object.assign({}, currentProgress))
    })

    stream.on('end', () => {
      Object.assign(currentProgress, { complete: true })
      progressCallback(Object.assign({}, currentProgress))
      resolve()
    })

    stream.on('error', (err) => {
      Object.assign(currentProgress, { error: err.toString() })
      progressCallback(Object.assign({}, currentProgress))
      reject(err)
    })
  })
}
