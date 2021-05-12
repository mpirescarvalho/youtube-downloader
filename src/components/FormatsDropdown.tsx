import React, { useEffect, useState } from 'react'
import { Flex, Text, Icon, Checkbox } from '@chakra-ui/react'
import { FaVolumeUp, FaVideo } from 'react-icons/fa'

import Dropdown, { DropdownProps } from './Dropdown'
import { videoFormat } from 'ytdl-core'

type FormatsDropdownProps = {
  formats: videoFormat[]
  splitTracks: boolean
  onSplitTracksChange: (value: boolean) => void
} & DropdownProps

const FormatsDropdown: React.FC<FormatsDropdownProps> = ({
  formats,
  splitTracks,
  onSplitTracksChange,
  ...props
}) => {
  const audioSelected = formats[props.selected] && !formats[props.selected].hasVideo

  function toggleSplitTracks() {
    onSplitTracksChange(!splitTracks)
  }

  useEffect(() => {
    if (!audioSelected) {
      onSplitTracksChange(false)
    }
  }, [audioSelected])

  return (
    <Flex direction="column">
      <Dropdown
        w="180px"
        paddingX="16px"
        colorScheme="red"
        variant="responsive"
        {...props}
      >
        {formats.map((format, index) => (
          <Flex key={index} w="148px" direction="row" justify="space-between" align="center">
            <Text>{format.container.toUpperCase()}{format.qualityLabel && ` • ${format.qualityLabel}`}</Text>
            <div>
              {format.hasVideo
                ? <Icon as={FaVideo} marginRight="2" />
                : <Icon as={FaVolumeUp} marginRight="2" />}
            </div>
          </Flex>
        ))}
      </Dropdown>

      {audioSelected && (
        <Checkbox
          checked={splitTracks}
          onChange={toggleSplitTracks}
          mt="2"
          colorScheme="red"
        >
          <Text fontWeight="bold">Split tracks</Text>
        </Checkbox>
      )}
    </Flex>
  )
}

export default FormatsDropdown
