import React, { FormEvent, useState } from 'react'
import { HStack, Input, IconButton, BoxProps, Flex, useToast } from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import YouTube from 'youtube-sr'

import Video from '../types/Video'
import { useVideos } from '../contexts/videos'

const SearchBar: React.FC<BoxProps> = (props) => {
  const [query, setQuery] = useState('')
  const { videos, setVideos } = useVideos()
  const toast = useToast()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    doSearch()
  }

  async function doSearch() {
    const newVideos: Video[] = []

    try {
      if (query) {
        setVideos({ ...videos, loading: true })

        if (YouTube.validate(query, 'VIDEO')) {
          const video = new Video(await YouTube.getVideo(query))
          newVideos.push(video)
        } else {
          const videos = (await YouTube.search(query, { type: 'video' }))
            .map(video => new Video(video))
          newVideos.push(...videos)
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An error occurred while fetching your query, please try again',
        status: 'error',
        duration: 4000,
        isClosable: true
      })
      console.error(err)
    } finally {
      setVideos({ data: newVideos, loading: false })
    }
  }

  return (
    <Flex
      width="100%"
      align="center"
      justify="center"
      flexShrink={0}
      background="gray.900"
      marginY="20px"
      paddingY="10px"
      position="sticky"
      top="0"
      zIndex="5"
    >
      <HStack
        as="form"
        marginBottom="0"
        onSubmit={handleSubmit}
        spacing="2"
        {...props}
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
          aria-label="Search"
          type="submit"
          icon={<Search2Icon />}
          isLoading={videos.loading}
        />
      </HStack>
    </Flex>
  )
}

export default SearchBar
