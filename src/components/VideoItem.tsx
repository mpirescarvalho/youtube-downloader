/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from 'react'
import { Flex, Image, Text, Avatar, useDisclosure } from '@chakra-ui/react'
import { Video } from 'youtube-sr'
import { DownloadIcon } from '@chakra-ui/icons'

import { formatNumber } from '../utils'
import DownloadModal from './DownloadModal'

interface VideoItemProps {
  video: Video
}

const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  const [hover, setHover] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex
      key={video.id!}
      w="100%"
      height="200px"
      overflow="hidden"
      align="stretch"
      justify="start"
      cursor="pointer"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Image
        src={video.thumbnail.url!}
        fit="cover"
        width={{ base: '240px', md: '300px', lg: '360px' }}
        bgColor="gray.300"
        borderRadius="md"
        marginRight="4"
        transition="width 0.6s"
      />

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
              name={video.channel.name!}
              src={video.channel.icon.url!}
              size="xs"
              colorScheme="red"
            />

            <Text fontSize="xs" color="gray.400" marginLeft="2">
              {video.channel.name}
            </Text>
          </Flex>

          <Text flex="1" fontSize="xs" color="gray.400" marginTop="3">
            {video.description}
          </Text>
        </Flex>
      </Flex>

      <DownloadModal
        video={video}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Flex>
  )
}

export default VideoItem
