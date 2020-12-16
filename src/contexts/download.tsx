import React, { createContext, useContext } from 'react'
import { Video } from 'youtube-sr'
import ytdl, { videoFormat } from 'ytdl-core'
import path from 'path'
import os from 'os'
import fs from 'fs'

export interface DownloadProgress {
  video: Video
  complete?: boolean
  error?: string
  percent?: number
  downloaded?: number
  total?: number
  time?: number
  timeLeft?: number
}
interface DownloaderData {
  download(
    video: Video,
    format: videoFormat,
    onProgress: (downloadProgress: DownloadProgress) => void
  ): Promise<void>
}

const DownloaderContext = createContext<DownloaderData>({} as DownloaderData)

export const DownloaderProvider: React.FC = ({ children }) => {
  async function download(
    video: Video,
    format: videoFormat,
    onProgress: (downloadProgress: DownloadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const outputPath = path.join(os.homedir(), 'Desktop')

        const stream = ytdl(video.url!)

        stream.pipe(fs.createWriteStream(path.resolve(outputPath, 'video.mp4')))

        let downloadProgress: DownloadProgress = {
          video,
          complete: false,
          percent: 0,
          downloaded: 0,
          total: 0,
          time: 0,
          timeLeft: 0
        }

        let starttime = Date.now()
        stream.once('response', () => {
          starttime = Date.now()
        })

        stream.on('progress', (chunkLength, downloaded, total) => {
          const percent = downloaded / total
          const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
          const estimatedDownloadTime =
            downloadedMinutes / percent - downloadedMinutes

          downloadProgress = {
            video,
            complete: percent === 1,
            percent,
            downloaded,
            total,
            time: downloadedMinutes,
            timeLeft: estimatedDownloadTime
          }

          onProgress(downloadProgress)
        })

        stream.on('end', () => {
          downloadProgress.complete = true
          onProgress(downloadProgress)
          resolve()
        })

        stream.on('error', (err) => {
          downloadProgress.error = err.toString()
          onProgress(downloadProgress)
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  return (
    <DownloaderContext.Provider value={{ download }}>
      {children}
    </DownloaderContext.Provider>
  )
}

export default function useDownloader(): DownloaderData {
  const context = useContext(DownloaderContext)
  return context
}
