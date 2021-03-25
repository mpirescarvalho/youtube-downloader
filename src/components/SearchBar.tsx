import React, { FormEvent, useState } from 'react'
import { HStack, Input, IconButton, BoxProps } from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import YouTube, { Video } from 'youtube-sr'

import { useVideos } from '../contexts/videos'

const SearchBar: React.FC<BoxProps> = (props) => {
  const [query, setQuery] = useState('')
  const { videos, setVideos } = useVideos()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (query) {
      setVideos({ ...videos, loading: true })
      const results = await YouTube.search(query)
      const videoResults = results.filter((result) => result instanceof Video)
      setVideos({ data: videoResults as Video[], loading: false })
    } else {
      setVideos({ data: [], loading: false })
    }
  }

  return (
    <HStack as="form" onSubmit={handleSubmit} spacing="2" {...props}>
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
  )
}

export default SearchBar
