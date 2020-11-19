import React, { FormEvent, useEffect, useState } from 'react'
import { HStack, Input, IconButton, BoxProps } from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import YouTube, { Video } from 'youtube-sr'

import LoadingState from '../types/LoadingState'

interface SearchBarProps extends BoxProps {
  onResult(videos: LoadingState<Video[]>): void
}

const SearchBar: React.FC<SearchBarProps> = ({ onResult, ...rest }) => {
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<LoadingState<Video[]>>({
    data: [],
    loading: false
  })

  useEffect(() => onResult(videos), [videos, onResult])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (query) {
      setVideos({ ...videos, loading: true })

      const results = await YouTube.search(query)

      const videoResults = results.filter((result) => result instanceof Video)

      setVideos({ data: videoResults as Video[], loading: false })
      console.log(videoResults)
    } else {
      setVideos({ data: [], loading: false })
    }
  }

  return (
    <HStack as="form" onSubmit={handleSubmit} spacing="2" {...rest}>
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
  )
}

export default SearchBar
