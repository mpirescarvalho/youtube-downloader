/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FormEvent, useState } from 'react'
import { render } from 'react-dom'
import {
  ChakraProvider,
  Input,
  Flex,
  HStack,
  IconButton,
  VStack,
  Box,
  Image,
  Text,
  Avatar
} from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import { Titlebar, Color } from 'custom-electron-titlebar'
import YT, { Video } from 'youtube-sr'

import theme from './styles/theme'
import icon from './assets/icon.svg'
import { formatNumber } from './utils'

interface VideosState {
  loading: boolean
  data: Video[]
}

new Titlebar({
  backgroundColor: Color.fromHex(theme.colors.gray[800]),
  titleHorizontalAlignment: 'left',
  menu: null,
  icon
})

const App = () => {
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<VideosState>({
    data: [],
    loading: false
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (query) {
      setVideos({ ...videos, loading: true })

      const results = await YT.search(query)

      const videoResults = results.filter((result) => result instanceof Video)

      setVideos({ data: videoResults as Video[], loading: false })
      console.log(videoResults)
    } else {
      setVideos({ data: [], loading: false })
    }
  }

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
        <HStack
          width="90%"
          maxW="1000px"
          as="form"
          onSubmit={handleSubmit}
          spacing="2"
          marginBottom="8"
        >
          <Input
            placeholder="Enter your search query or url"
            borderColor="gray.700"
            focusBorderColor="red.500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <IconButton
            colorScheme="red"
            aria-label="Search database"
            type="submit"
            icon={<Search2Icon />}
            isLoading={videos.loading}
          />
        </HStack>

        <VStack spacing="4" width="90%" maxW="1000px">
          {videos.data.map((video) => (
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

                  <Flex
                    align="center"
                    justify="start"
                    direction="row"
                    marginTop="4"
                  >
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
          ))}
        </VStack>
      </Flex>
    </ChakraProvider>
  )
}

render(<App />, document.getElementById('root'))
