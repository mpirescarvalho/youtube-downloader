import React from 'react'
import { VStack, BoxProps } from '@chakra-ui/react'
import { Video } from 'youtube-sr'

import VideoItem from './VideoItem'

interface VideoListProps extends BoxProps {
  videos: Video[]
}

const VideoList: React.FC<VideoListProps> = ({ videos, ...rest }) => {
  return (
    <VStack spacing="4" {...rest}>
      {videos.map((video) => (
        <VideoItem key={String(video.id)} video={video} />
      ))}
    </VStack>
  )
}

export default VideoList
