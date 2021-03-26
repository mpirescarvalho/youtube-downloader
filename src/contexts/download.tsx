import React, { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react'
import { useThrottledCallback } from 'use-debounce'
import { Video } from 'youtube-sr'
import ytdl, { videoFormat } from 'ytdl-core'
import path from 'path'
import os from 'os'
import fs from 'fs'
import produce from 'immer'

export type DownloadProgress = {
  complete: boolean
  error?: string
  percent: number
  downloaded: number
  total: number
  time: number
  timeLeft: number
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

  const updateDownloads = useThrottledCallback((updateFunc: (draft: Downloads) => void) => {
    setDownloads(produce(updateFunc))
  }, 300, { leading: true, trailing: true })

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

        updateDownloads(draft => {
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
        })
        updateDownloads.flush()

        let starttime = Date.now()
        stream.once('response', () => {
          starttime = Date.now()
        })

        stream.on('progress', (chunkLength, downloaded, total) => {
          const percent = downloaded / total
          const downloadedSeconds = (Date.now() - starttime) / 1000
          const estimatedDownloadTime =
            downloadedSeconds / percent - downloadedSeconds

          updateDownloads(draft => {
            draft[videoId].progress = {
              complete: percent === 1,
              percent,
              downloaded,
              total,
              time: downloadedSeconds,
              timeLeft: estimatedDownloadTime
            }
          })

          if (percent === 1) {
            updateDownloads.flush()
          }
        })

        stream.on('end', () => {
          updateDownloads(draft => {
            draft[videoId].progress.complete = true
          })
          updateDownloads.flush()
          setTimeout(() => {
            updateDownloads(draft => {
              delete draft[videoId]
            })
            updateDownloads.flush()
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

export function useDownload(): DownloadFunction {
  const context = useContext(DownloaderContext)
  const download = useMemo(() => context.download, [context.download])
  return download
}

export type DownloadInfo = Download | undefined

export function useDownloadInfo(videoId: string): DownloadInfo {
  const context = useContext(DownloaderContext)
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>()
  useEffect(() => {
    const downloadInfoById = context.downloads[videoId]
    if (JSON.stringify(downloadInfo) !== JSON.stringify(downloadInfoById)) {
      setDownloadInfo(downloadInfoById)
    }
  }, [downloadInfo, context.downloads])
  return downloadInfo
}

export function useIsDownloading(videoId: string): boolean {
  const context = useContext(DownloaderContext)
  const [isDownloading, setIsDownloading] = useState(false)
  useEffect(() => {
    const exists = context.downloads[videoId]
    if (!!exists !== isDownloading) {
      setIsDownloading(!!exists)
    }
  }, [isDownloading, context.downloads])
  return isDownloading
}

export function useDownloadingVideos(): Video[] {
  const context = useContext(DownloaderContext)
  const [downloadingVideos, setDownloadingVideos] = useState<Video[]>([])
  useEffect(() => {
    const newDownloadingVideos =
      Object.values(context.downloads).map(download => download.video)
    if (JSON.stringify(downloadingVideos) !== JSON.stringify(newDownloadingVideos)) {
      setDownloadingVideos(newDownloadingVideos)
    }
  }, [downloadingVideos, context.downloads])
  return downloadingVideos
}
