import React, { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react'
import { useThrottledCallback } from 'use-debounce'
import { Video } from 'youtube-sr'
import { videoFormat } from 'ytdl-core'
import produce from 'immer'

import { downloadVideo, downloadAudio } from '../utils/downloader'

export type DownloadStatus = 'starting' | 'downloading' | 'paused' | 'stopped' | 'finished' | 'failed'

export type DownloadProgress = {
  status: DownloadStatus
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
    if (!video.id) {
      throw new Error('Invalid video id')
    }

    const onProgress = (progress: DownloadProgress) => {
      updateDownloads(draft => {
        draft[video.id!] = {
          video,
          format,
          progress
        }
      })

      if (['starting', 'paused', 'stopped', 'finished', 'failed'].includes(progress.status)) {
        updateDownloads.flush()
      }
    }

    try {
      if (format.hasVideo) {
        await downloadVideo(video, format, onProgress)
      } else {
        await downloadAudio(video, format, onProgress)
      }
    } finally {
      clearDownload(video.id!, 4000)
    }
  }, [setDownloads])

  function clearDownload(videoId: string, timeout: number) {
    setTimeout(() => {
      updateDownloads(draft => {
        delete draft[videoId]
      })
      updateDownloads.flush()
    }, timeout)
  }

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

export function useDownloadStatus(videoId: string): DownloadStatus | null {
  const { downloads } = useContext(DownloaderContext)
  const [status, setStatus] = useState<DownloadStatus | null>(null)
  useEffect(() => {
    let newStatus: DownloadStatus | null = null
    const download = downloads[videoId]
    if (download) {
      newStatus = download.progress.status
    }
    if (newStatus !== status) {
      setStatus(newStatus)
    }
  }, [status, downloads])
  return status
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
