import { Flex, Text, Progress as ChakraProgress } from '@chakra-ui/react'
import React from 'react'

type ProgressProps = {
  percent: number
  downloaded: number
  total: number
  time: number
  timeLeft: number
}

function formatSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2).toString() + ' MB'
}

function formatTimeLeft(secondsLeft: number): string {
  return new Date(1000 * secondsLeft).toISOString().substr(11, 8)
}

const Progress: React.FC<ProgressProps> = ({ percent, downloaded, total, timeLeft }) => {
  const percentage = Math.trunc(percent * 100)

  return (
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
  )
}

export default Progress
