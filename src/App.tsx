import React, { useState } from 'react'
import { render } from 'react-dom'
import { Box, ChakraProvider, Flex } from '@chakra-ui/react'
import { Titlebar, Color } from 'custom-electron-titlebar'
import { Video } from 'youtube-sr'
import { Scrollbars } from 'react-custom-scrollbars'

import LoadingState from './types/LoadingState'

import theme from './styles/theme'
import icon from './assets/icon.svg'

import VideoList from './components/VideoList'
import SearchBar from './components/SearchBar'

import { DownloaderProvider } from './contexts/download'
import { VideosProvider } from './contexts/videos'

import 'focus-visible/dist/focus-visible'

new Titlebar({
  backgroundColor: Color.fromHex(theme.colors.gray[800]),
  titleHorizontalAlignment: 'left',
  menu: null,
  icon
})

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <DownloaderProvider>
        <VideosProvider>
          <Scrollbars
            id="scroll-container"
            renderThumbVertical={(props) => (
              <Box
                {...props}
                opacity="0.7"
                bgColor="red.500"
                borderRadius="8px"
              />
            )}
          >
            <Flex
              direction="column"
              align="center"
              justify="start"
              minH="100%"
              background="gray.900"
              color="gray.100"
              overflowX="hidden"
              paddingY="10"
            >
              <SearchBar
                w="90%"
                maxW="1000px"
                marginBottom="8"
              />

              <VideoList width="90%" maxW="1000px" />
            </Flex>
          </Scrollbars>
        </VideosProvider>
      </DownloaderProvider>
    </ChakraProvider>
  )
}

render(<App />, document.getElementById('root'))
