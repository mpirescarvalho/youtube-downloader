import React from 'react'
import { VStack, BoxProps } from '@chakra-ui/react'

import VideoItem from './VideoItem'
import { useVideos } from '../contexts/videos'

const VideoList: React.FC<BoxProps> = (props) => {
  const { videos } = useVideos()

  return (
    <VStack spacing="4" {...props}>
      {videos.data.map((video) => (
        <VideoItem key={String(video.id)} video={video} />
      ))}
    </VStack>
  )
}

export default VideoList
