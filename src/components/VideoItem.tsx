/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from 'react'
import { Flex, Image, Text, Avatar, Box } from '@chakra-ui/react'
import { Video } from 'youtube-sr'
import { DownloadIcon } from '@chakra-ui/icons'

import { useDownloadModal } from '../contexts/downloadModal'
import { formatNumber } from '../utils'
import Progress from './Progress'

interface VideoItemProps {
  video: Video
}

const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  const [hover, setHover] = useState(false)
  const { open } = useDownloadModal()

  return (
    <Flex
      key={video.id!}
      w="100%"
      height="200px"
      overflow="hidden"
      align="stretch"
      justify="start"
      cursor="pointer"
      onClick={() => open(video)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box
        width={{ base: '240px', md: '300px', lg: '360px' }}
        flexShrink={0}
        overflow="hidden"
        marginRight="4"
        borderRadius="md"
        bgColor="gray.300"
        transition="width 0.6s"
        position="relative"
      >
        <Image
          src={video.thumbnail?.url}
          fit="cover"
          width="100%"
          height="100%"
        />

        <Text
          background="blackAlpha.800"
          fontWeight="bold"
          position="absolute"
          bottom="1"
          right="1"
          fontSize="smaller"
          borderRadius="md"
          paddingX="4px"
          textAlign="center"
        >
          {video.durationFormatted}
        </Text>
      </Box>

      <Flex flex="1">
        <Flex direction="column" align="start" justify="stretch" w="100%">
          <Flex direction="row" width="100%">
            <Text flex="1" isTruncated noOfLines={2} fontWeight="bold">
              {video.title}
            </Text>

            <DownloadIcon
              w="5"
              h="5"
              marginRight="1"
              visibility={hover ? 'visible' : 'hidden'}
            />
          </Flex>

          <Text fontSize="xs" color="gray.400">
            {formatNumber(Number(video.views))} views
            <Text as="span" marginX="2">
              •
            </Text>
            {video.uploadedAt}
          </Text>

          <Flex align="center" justify="start" direction="row" marginTop="4">
            <Avatar
              name={video.channel?.name}
              src={video.channel?.icon.url}
              size="xs"
              colorScheme="red"
            />

            <Text fontSize="xs" color="gray.400" marginLeft="2">
              {video.channel?.name}
            </Text>
          </Flex>

          <Text flex="1" fontSize="xs" color="gray.400" marginTop="3">
            {video.description}
          </Text>

          <Progress
            videoId={video.id!}
            width="100%"
            marginTop="3"
            flexShrink={0}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default VideoItem
