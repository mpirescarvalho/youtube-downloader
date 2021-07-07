import {
  Flex,
  Text,
  Progress as ChakraProgress,
  BoxProps,
  Box
} from '@chakra-ui/react'
import React from 'react'
import { useDownloadInfo } from '../contexts/download'
import { capitalizeFirstLetter, formatTimeLeft, formatBytes } from '../utils'

type ProgressProps = {
  videoId: string
} & BoxProps
const Progress: React.FC<ProgressProps> = ({ videoId, ...props }) => {
  const downloadInfo = useDownloadInfo(videoId)

  if (!downloadInfo?.progress) {
    return null
  }

  const {
    percent,
    downloaded,
    total,
    timeLeft,
    status
  } = downloadInfo?.progress

  const percentage = Math.trunc(percent * 100)

  return (
    <Box {...props}>
      <Flex direction="column" >
        <ChakraProgress
          value={percentage}
          width="100%"
          colorScheme="green"
          borderRadius="2"
          isIndeterminate={['starting', 'processing'].includes(status)}
        />

        <Flex
          direction="row"
          justifyContent="space-between"
          fontSize="sm"
          fontWeight="bold"
          color="white"
          marginTop="2"
        >
          <Text>{capitalizeFirstLetter(status)}</Text>
          <Text>{percentage}%</Text>
        </Flex>

        <Flex
          direction="row"
          justifyContent="space-between"
          fontSize="smaller"
          fontWeight="bold"
          color="gray.500"
        >
          <Text>
            {formatBytes(downloaded)} / {formatBytes(total)}
          </Text>
          <Text>{formatTimeLeft(timeLeft)}</Text>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Progress
