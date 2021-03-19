import React, { createContext, useContext, useCallback, useState } from 'react'
import { Video } from 'youtube-sr'
import ytdl, { videoFormat } from 'ytdl-core'
import path from 'path'
import os from 'os'
import fs from 'fs'
import produce from 'immer'

export type DownloadProgress = {
  complete?: boolean
  error?: string
  percent?: number
  downloaded?: number
  total?: number
  time?: number
  timeLeft?: number
}

export type DownloadFunction = (video: Video, format: videoFormat) => Promise<void>;
export type Download = {
  video: Video
  format: videoFormat
  progress: DownloadProgress
}

export type Downloads = Record<string, Download>

export interface DownloaderData {
  downloads: Downloads
  download: DownloadFunction
}

const DownloaderContext = createContext<DownloaderData>({} as DownloaderData)

export const DownloaderProvider: React.FC = ({ children }) => {
  const [downloads, setDownloads] = useState<Downloads>({})

  const download: DownloadFunction = useCallback(async (video, format) => {
    return new Promise((resolve, reject) => {
      if (!video.id) {
        reject(new Error('Invalid video id'))
      }

      const videoId = video.id!

      try {
        const outputPath = path.join(os.homedir(), 'Desktop')
        const stream = ytdl(video.url!)
        stream.pipe(fs.createWriteStream(path.resolve(outputPath, `${video.title}.mp4`)))

        setDownloads(produce((draft: Downloads) => {
          draft[videoId] = {
            video,
            format,
            progress: {
              complete: false,
              percent: 0,
              downloaded: 0,
              total: 0,
              time: 0,
              timeLeft: 0
            }
          }
        }))

        let starttime = Date.now()
        stream.once('response', () => {
          starttime = Date.now()
        })

        stream.on('progress', (chunkLength, downloaded, total) => {
          const percent = downloaded / total
          const downloadedMinutes = (Date.now() - starttime) / 1000 / 60
          const estimatedDownloadTime =
            downloadedMinutes / percent - downloadedMinutes

          setDownloads(produce((draft: Downloads) => {
            draft[videoId].progress = {
              complete: percent === 1,
              percent,
              downloaded,
              total,
              time: downloadedMinutes,
              timeLeft: estimatedDownloadTime
            }
          }))
        })

        stream.on('end', () => {
          setDownloads(produce((draft: Downloads) => {
            draft[videoId].progress.complete = true
          }))
          setTimeout(() => {
            setDownloads(produce((draft: Downloads) => {
              delete draft[videoId]
            }))
          }, 4000)
          resolve()
        })

        stream.on('error', (err) => {
          setDownloads(produce((draft: Downloads) => {
            draft[videoId].progress.error = err.toString()
          }))
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }, [setDownloads])

  return (
    <DownloaderContext.Provider value={{ download, downloads }}>
      {children}
    </DownloaderContext.Provider>
  )
}

export function useDownload(): DownloaderData {
  const context = useContext(DownloaderContext)
  return context
}

export type DownloadInfo = Download | undefined

export function useDownloadInfo(videoId: string): DownloadInfo {
  const context = useContext(DownloaderContext)
  const downloadInfo = context.downloads[videoId]
  return downloadInfo
}
