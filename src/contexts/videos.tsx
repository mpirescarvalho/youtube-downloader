import React, { createContext, useContext, useState } from 'react'
import { Video } from 'youtube-sr'

import LoadingState from '../types/LoadingState'

type Videos = LoadingState<Video[]>

type VideosData = {
  videos: Videos
  setVideos: React.Dispatch<React.SetStateAction<Videos>>
}

const VideosContext = createContext<VideosData>({} as VideosData)

export const VideosProvider: React.FC = ({ children }) => {
  const [videos, setVideos] = useState<Videos>({
    data: [],
    loading: false
  })

  return (
    <VideosContext.Provider value={{ videos, setVideos }}>
      {children}
    </VideosContext.Provider>
  )
}

export function useVideos(): VideosData {
  const context = useContext(VideosContext)
  return context
}
