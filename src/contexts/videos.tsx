import React, { createContext, useContext, useMemo, useState } from 'react'
import { Video } from 'youtube-sr'

import LoadingState from '../types/LoadingState'
import { useDownloadingVideos } from './download'

type Videos = LoadingState<Video[]>

type VideosData = {
  videos: Videos
  setVideos: React.Dispatch<React.SetStateAction<Videos>>
}

const VideosContext = createContext<VideosData>({} as VideosData)

export const VideosProvider: React.FC = ({ children }) => {
  const downloadingVideos = useDownloadingVideos()
  const [rawVideos, setRawVideos] = useState<Videos>({
    data: [],
    loading: false
  })

  const videos = useMemo<Videos>(() => {
    const downloadingVideosHash = downloadingVideos.reduce((prev, curr) => {
      prev[curr.id!] = curr
      return prev
    }, {} as Record<string, Video>)
    return {
      loading: rawVideos.loading,
      data: [
        ...downloadingVideos,
        ...(rawVideos.data.filter(video => !downloadingVideosHash[video.id!]))
      ]
    }
  }, [downloadingVideos, rawVideos])

  return (
    <VideosContext.Provider value={{ videos, setVideos: setRawVideos }}>
      {children}
    </VideosContext.Provider>
  )
}

export function useVideos(): VideosData {
  const context = useContext(VideosContext)
  return context
}
