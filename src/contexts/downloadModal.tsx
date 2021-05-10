import { useDisclosure } from '@chakra-ui/react'
import React, { useContext, createContext, useState } from 'react'

import Video from '../types/Video'
import DownloadModal from '../components/DownloadModal'

type DownloadModalData = {
  open: (video: Video) => void
  close: () => void
  isOpen: boolean
}

const DownloadModalContext = createContext<DownloadModalData>({} as DownloadModalData)

export const DownloadModalProvider: React.FC = ({ children }) => {
  const [video, setVideo] = useState<Video | undefined>()
  const { isOpen, onOpen, onClose } = useDisclosure()

  function open(video: Video) {
    setVideo(video)
    onOpen()
  }

  return (
    <DownloadModalContext.Provider value={{ isOpen, close: onClose, open }}>
      {children}

      {video && (
        <DownloadModal
          video={video}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </DownloadModalContext.Provider>
  )
}

export function useDownloadModal(): DownloadModalData {
  const context = useContext(DownloadModalContext)
  return context
}
