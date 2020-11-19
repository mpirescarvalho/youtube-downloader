/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { Flex, Image, Box, Text, Avatar } from '@chakra-ui/react'
import { Video } from 'youtube-sr'

import { formatNumber } from '../utils'

interface VideoItemProps {
  video: Video
}

const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  return (
    <Flex
      key={video.id!}
      w="100%"
      height="200px"
      overflow="hidden"
      align="stretch"
      justify="start"
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
        <Box>
          <Text isTruncated noOfLines={2} fontWeight="bold">
            {video.title}
          </Text>

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
        </Box>
      </Flex>
    </Flex>
  )
}

export default VideoItem
