/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useRef, useState } from 'react'
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
import ytdl, { videoFormat } from 'ytdl-core'

import { formatNumber, filterBetterFormats } from '../utils'
import useVisibility from '../hooks/useVisibility'
import useDownloader from '../contexts/download'

import Dropdown from './Dropdown'

interface VideoItemProps {
  video: Video
}

const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
  const [loadingDownloadOptions, setLoadingDownloadOptions] = useState(true)
  const [formats, setFormats] = useState<videoFormat[]>([])
  const [selectedFormat, setSelectedFormat] = useState(0)

  const downloadOptionsLoadTriggered = useRef(false)

  const [isVisible, ref] = useVisibility<HTMLDivElement>()

  const { downloading, download } = useDownloader()

  useEffect(() => {
    if (isVisible && !downloadOptionsLoadTriggered.current) {
      downloadOptionsLoadTriggered.current = true
      loadDownloadOptions()
    }
  }, [isVisible])

  async function loadDownloadOptions() {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
      const info = await ytdl.getInfo(videoUrl)
      setFormats(filterBetterFormats(info.formats))
      setLoadingDownloadOptions(false)
    } catch (err) {
      console.error(err)
    }
  }

  function handleDownloadClick() {
    download(video, formats[selectedFormat])
  }

  return (
    <Flex
      ref={ref}
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

          {downloading[video.id!] && (
            <>
              <Text size="xs">complete: {downloading[video.id!].complete}</Text>
              <Text size="xs">error: {downloading[video.id!].error}</Text>
              <Text size="xs">
                downloaded: {downloading[video.id!].downloaded}
              </Text>
              <Text size="xs">total: {downloading[video.id!].total}</Text>
              <Text size="xs">percent: {downloading[video.id!].percent}</Text>
              <Text size="xs">time: {downloading[video.id!].time}</Text>
              <Text size="xs">timeLeft: {downloading[video.id!].timeLeft}</Text>
            </>
          )}

          <Spacer flex="1" />

          <HStack paddingBottom="2" w="100%">
            <Dropdown
              w="200px"
              colorScheme="green"
              selected={selectedFormat}
              setSelected={setSelectedFormat}
              isLoading={loadingDownloadOptions}
            >
              {formats
                .filter((_, index) => index !== formats.length - 1)
                .map((format, index) => (
                  <Box key={index} display="flex" flexDirection="row">
                    <div>mp4</div>
                    <Spacer />
                    <div>
                      <Text marginRight="2" display="inline">
                        {format.hasVideo && '🎥'}
                        {format.hasAudio && '🔊'}
                      </Text>
                      {format.qualityLabel}
                    </div>
                  </Box>
                ))}

              <Box display="flex" flexDirection="row">
                <div>mp3</div>
                <Spacer />
                <div>
                  <Text marginRight="2" display="inline">
                    🔊
                  </Text>
                </div>
              </Box>
            </Dropdown>

            <IconButton
              aria-label="Download"
              icon={<DownloadIcon />}
              colorScheme="green"
              isLoading={loadingDownloadOptions}
              onClick={handleDownloadClick}
            />
          </HStack>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default VideoItem
