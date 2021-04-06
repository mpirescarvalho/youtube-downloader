import React, { createContext, useContext, useCallback, useState, useMemo, useEffect, useRef } from 'react'
import { useThrottledCallback } from 'use-debounce'
import { Video } from 'youtube-sr'
import { videoFormat } from 'ytdl-core'
import produce from 'immer'

import { download as executeDownload, DownloadController } from '../utils/downloader'
import DownloadAbortError from '../errors/DownloadAbortError'

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
export type Controllers = Record<string, DownloadController>

export interface DownloaderData {
  downloads: Downloads
  download: DownloadFunction
  pause: (video: Video) => void
  resume: (video: Video) => void
  stop: (video: Video) => void
}

const DownloaderContext = createContext<DownloaderData>({} as DownloaderData)

export const DownloaderProvider: React.FC = ({ children }) => {
  const [downloads, setDownloads] = useState<Downloads>({})
  const controllers = useRef<Controllers>({})

  const updateDownloads = useThrottledCallback((updateFunc: (draft: Downloads) => void) => {
    setDownloads(produce(updateFunc))
  }, 300, { leading: true, trailing: true })

  const download: DownloadFunction = useCallback(async (video, format) => {
    if (!video.id) {
      throw new Error('Invalid video id')
    }

    const controller = new DownloadController()
    controllers.current[video.id!] = controller

    const progressCallback = (progress: DownloadProgress) => {
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
      await executeDownload({
        video,
        format,
        controller,
        progressCallback,
        audioOnly: !format.hasVideo
      })
    } catch (err) {
      if (err instanceof DownloadAbortError) {
        clearDownload(video.id!, 0)
      } else {
        throw err
      }
    } finally {
      clearDownload(video.id!, 4000)
    }
  }, [setDownloads])

  const pause = useCallback((video: Video) => {
    controllers.current[video.id!]?.pause()
  }, [])

  const resume = useCallback((video: Video) => {
    controllers.current[video.id!]?.resume()
  }, [])

  const stop = useCallback((video: Video) => {
    controllers.current[video.id!]?.stop()
  }, [])

  function clearDownload(videoId: string, timeout: number) {
    setTimeout(() => {
      updateDownloads(draft => {
        delete draft[videoId]
      })
      updateDownloads.flush()
      delete controllers.current[videoId]
    }, timeout)
  }

  return (
    <DownloaderContext.Provider value={{
      download,
      downloads,
      pause,
      resume,
      stop
    }}>
      {children}
    </DownloaderContext.Provider>
  )
}

export function useDownloaderData(): DownloaderData {
  const context = useContext(DownloaderContext)
  return context
}

export function useDownloader(): Omit<DownloaderData, 'downloads'> {
  const { download, pause, resume, stop } = useContext(DownloaderContext)
  const downloader = useMemo(() => ({ download, pause, resume, stop }), [download, pause, resume, stop])
  return downloader
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
  }, [videoId, downloadInfo, context.downloads])
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
  }, [videoId, status, downloads])
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
