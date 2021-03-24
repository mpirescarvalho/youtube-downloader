import { Flex, Text, Progress as ChakraProgress, BoxProps, Box } from '@chakra-ui/react'
import React from 'react'
import { useDownloadInfo } from '../contexts/download'

type ProgressProps = {
  videoId: string
} & BoxProps

function formatSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2).toString() + ' MB'
}

function formatTimeLeft(secondsLeft: number): string {
  return new Date(1000 * secondsLeft).toISOString().substr(11, 8)
}

const Progress: React.FC<ProgressProps> = ({ videoId, ...props }) => {
  const downloadInfo = useDownloadInfo(videoId)

  if (!downloadInfo?.progress) {
    return null
  }

  const {
    percent,
    downloaded,
    total,
    timeLeft
  } = downloadInfo.progress

  const percentage = Math.trunc(percent * 100)

  return (
    <Box {...props}>
      <Flex direction="column" >
        <ChakraProgress
          value={percentage}
          width="100%"
          colorScheme="green"
          borderRadius="2"
        />

        <Flex
          direction="row"
          justifyContent="space-between"
          fontSize="sm"
          fontWeight="bold"
          color="white"
          marginTop="2"
        >
          <Text>Fazendo download</Text>
          <Text>{percentage}%</Text>
        </Flex>

        <Flex
          direction="row"
          justifyContent="space-between"
          fontSize="smaller"
          fontWeight="bold"
          color="gray.500"
        >
          <Text>{formatSize(downloaded)} / {formatSize(total)}</Text>
          <Text>{formatTimeLeft(timeLeft)}</Text>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Progress
