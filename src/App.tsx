import React, { useState } from 'react'
import { render } from 'react-dom'
import { ChakraProvider, Flex } from '@chakra-ui/react'
import { Titlebar, Color } from 'custom-electron-titlebar'
import { Video } from 'youtube-sr'

import LoadingState from './types/LoadingState'

import theme from './styles/theme'
import icon from './assets/icon.svg'

import VideoList from './components/VideoList'
import SearchBar from './components/SearchBar'

new Titlebar({
  backgroundColor: Color.fromHex(theme.colors.gray[800]),
  titleHorizontalAlignment: 'left',
  menu: null,
  icon
})

const App = () => {
  const [videos, setVideos] = useState<LoadingState<Video[]>>({
    data: [],
    loading: false
  })

  return (
    <ChakraProvider theme={theme}>
      <Flex
        direction="column"
        align="center"
        justify="start"
        h="100%"
        background="gray.900"
        color="gray.100"
        overflowX="hidden"
        overflowY="scroll"
        paddingY="10"
      >
        <SearchBar
          w="90%"
          maxW="1000px"
          marginBottom="8"
          onResult={setVideos}
        />

        <VideoList width="90%" maxW="1000px" videos={videos.data} />
      </Flex>
    </ChakraProvider>
  )
}

render(<App />, document.getElementById('root'))
