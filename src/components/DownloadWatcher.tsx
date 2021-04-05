import React, { useEffect, useRef, useState } from 'react'
import { useToast } from '@chakra-ui/react'

import { Download, useDownloader } from '../contexts/download'

type WatchedDownloads = Record<string, Download>

const DownloadWatcher: React.FC = () => {
  const { downloads } = useDownloader()
  const toast = useToast()

  const oldWatchedDownloads = useRef<WatchedDownloads>({})
  const [watchedDownloads, setWatchedDownloads] = useState<WatchedDownloads>({})

  useEffect(() => {
    let changed = false
    const newWatchedDownloads: WatchedDownloads = {}
    Object.values(downloads).forEach(download => {
      const oldWatchedDownload = watchedDownloads[download.video.id!]
      if (!oldWatchedDownload || (oldWatchedDownload.progress.status !== download.progress.status)) {
        changed = true
      }
      newWatchedDownloads[download.video.id!] = download
    })
    Object.values(watchedDownloads).forEach(download => {
      if (!downloads[download.video.id!]) {
        changed = true
      }
    })
    if (changed) {
      setWatchedDownloads(newWatchedDownloads)
    }
  }, [downloads, watchedDownloads])

  useEffect(() => {
    Object.values(watchedDownloads).forEach(download => {
      const oldStatus = oldWatchedDownloads.current[download.video.id!]?.progress?.status
      const newStatus = download.progress.status

      if (oldStatus !== newStatus) {
        switch (newStatus) {
          case 'finished':
            toast({
              title: 'Download finished',
              description: download.video.title,
              status: 'success',
              duration: 4000,
              isClosable: true
            })
            break
          case 'failed':
            toast({
              title: 'Download Error',
              description: download.video.title,
              status: 'error',
              duration: 4000,
              isClosable: true
            })
            break
        }
      }
    })

    oldWatchedDownloads.current = watchedDownloads
  }, [watchedDownloads])

  return null
}

export default DownloadWatcher
