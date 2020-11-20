/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from 'react'
import {
  Flex,
  Image,
  Text,
  Avatar,
  Spacer,
  HStack,
  IconButton,
  Box
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { Video } from 'youtube-sr'

import { formatNumber } from '../utils'

import Dropdown from './Dropdown'

interface VideoItemProps {
  video: Video
}

const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  const [loadingDownloadOptions, setLoadingDownloadOptions] = useState(true)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [quality, setQuality] = useState(0)

  // async function loadDownloadOptions() {}

  return (
    <Flex
      key={video.id!}
      w="100%"
      height="200px"
      overflow="hidden"
      align="stretch"
      justify="start"
      onMouseEnter={() => setShowDownloadOptions(true)}
      onMouseLeave={() => setShowDownloadOptions(false)}
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
        <Flex direction="column" align="start" justify="stretch">
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

          <Spacer flex="1" />

          <Box display={showDownloadOptions ? 'block' : 'none'}>
            <HStack paddingBottom="2" w="100%">
              <Dropdown
                w="200px"
                colorScheme="green"
                selected={quality}
                setSelected={setQuality}
                isLoading={loadingDownloadOptions}
              >
                <Box display="flex" flexDirection="row">
                  <div>MP4</div>
                  <Spacer />
                  <div>
                    <Text marginRight="2" display="inline">
                      🎥🔊
                    </Text>
                    720p
                  </div>
                </Box>
                <Box display="flex" flexDirection="row">
                  <div>MP3</div>
                  <Spacer />
                  <div>
                    <Text marginRight="2" display="inline">
                      🔊
                    </Text>
                    720p
                  </div>
                </Box>
                <Box display="flex" flexDirection="row">
                  <div>MP4</div>
                  <Spacer />
                  <div>
                    <Text marginRight="2" display="inline">
                      🎥🔊
                    </Text>
                    360p
                  </div>
                </Box>
                <Box display="flex" flexDirection="row">
                  <div>MP4</div>
                  <Spacer />
                  <div>
                    <Text marginRight="2" display="inline">
                      🎥
                    </Text>
                    1080p
                  </div>
                </Box>
              </Dropdown>

              <IconButton
                aria-label="Download"
                icon={<DownloadIcon />}
                colorScheme="green"
                isLoading={loadingDownloadOptions}
              />
            </HStack>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default VideoItem
