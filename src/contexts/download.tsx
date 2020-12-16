import React, { createContext, useContext, useEffect, useState } from 'react'
import { Video } from 'youtube-sr'
import ytdl, { videoFormat } from 'ytdl-core'
import produce from 'immer'
import path from 'path'
import os from 'os'
import fs from 'fs'

interface Downloading {
  [key: string]: {
    video: Video
    complete?: boolean
    error?: string
    percent?: number
    downloaded?: number
    total?: number
    time?: number
    timeLeft?: number
  }
}
interface DownloaderData {
  downloading: Downloading
  download(video: Video, format: videoFormat): void
}

const DownloaderContext = createContext<DownloaderData>({} as DownloaderData)

export const DownloaderProvider: React.FC = ({ children }) => {
  const [downloading, setDownloading] = useState<Downloading>({})

  async function download(video: Video, format: videoFormat) {
    const outputPath = path.join(os.homedir(), 'Desktop')

    const stream = ytdl(video.url!)

    setDownloading((prevState) =>
      produce(prevState, (draft) => {
        draft[video.id as string] = {
          video
        }
      })
    )

    stream.pipe(fs.createWriteStream(path.resolve(outputPath, 'video.mp4')))

    let starttime = Date.now()
    stream.once('response', () => {
      starttime = Date.now()
    })

    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total
      const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
      const estimatedDownloadTime =
        downloadedMinutes / percent - downloadedMinutes

      setDownloading((prevState) =>
        produce(prevState, (draft) => {
          draft[video.id as string] = {
            video,
            complete: percent === 1,
            percent,
            downloaded,
            total,
            time: downloadedMinutes,
            timeLeft: estimatedDownloadTime
          }
        })
      )
    })

    stream.on('end', () => {
      setDownloading((prevState) =>
        produce(prevState, (draft) => {
          draft[video.id as string].complete = true
        })
      )
    })

    stream.on('error', (err) => {
      setDownloading((prevState) =>
        produce(prevState, (draft) => {
          draft[video.id as string].error = err.toString()
        })
      )
    })
  }

  return (
    <DownloaderContext.Provider
      value={{
        downloading,
        download
      }}
    >
      {children}
    </DownloaderContext.Provider>
  )
}

export default function useDownloader(): DownloaderData {
  const context = useContext(DownloaderContext)
  return context
}
