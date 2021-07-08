import React from 'react'
import { Flex } from '@chakra-ui/react'

import VideoList from '../components/VideoList'
import SearchBar from '../components/SearchBar'

const HomeScreen: React.FC = () => {
  return (
    <Flex direction="column" align="center" justify="start" paddingBottom="8">
      <SearchBar w="90%" maxW="1000px" />
      <VideoList width="90%" maxW="1000px" />
    </Flex>
  )
}

export default HomeScreen
