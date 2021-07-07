import React, { useEffect, useMemo } from 'react'
import { Flex, Text, Icon, Checkbox, Tooltip } from '@chakra-ui/react'
import { FaVolumeUp, FaVideo } from 'react-icons/fa'
import { videoFormat } from 'ytdl-core'

import Dropdown, { DropdownProps } from './Dropdown'
import { formatBytes } from '../utils'

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
  const selectedFormat = formats[props.selected]
  const audioSelected = selectedFormat && !selectedFormat.hasVideo

  const formatsWithRealSize = useMemo(() => {
    const audioTrack = formats.find((format) => format.extension === 'mp3')
    return formats.map((format) => {
      if (
        !audioTrack ||
        !audioTrack.contentLength ||
        !format.contentLength ||
        format === audioTrack
      ) {
        return format
      } else {
        return {
          ...format,
          contentLength: (
            parseInt(format.contentLength) + parseInt(audioTrack.contentLength)
          ).toString()
        } as videoFormat
      }
    })
  }, [formats])

  function toggleSplitTracks() {
    onSplitTracksChange(!splitTracks)
  }

  useEffect(() => {
    if (selectedFormat && !audioSelected) {
      onSplitTracksChange(false)
    }
  }, [audioSelected])

  return (
    <Flex direction="column">
      <Dropdown
        w="280px"
        paddingX="16px"
        colorScheme="red"
        variant="responsive"
        {...props}
      >
        {formats.map((format, index) => (
          <Flex key={index} w="248px" direction="row" align="center">
            <Flex flex="1" align="center" justify="space-between">
              <Text>{format.extension.toUpperCase()}</Text>
              <Text>{format.qualityLabel}</Text>
            </Flex>

            <Flex flex="1" align="center" justify="flex-end">
              <Text>
                {formatsWithRealSize[index].contentLength &&
                  formatBytes(formatsWithRealSize[index].contentLength)}
              </Text>
            </Flex>

            <Flex align="center" justify="flex-end">
              {format.hasVideo ? (
                <Icon as={FaVideo} marginRight="2" marginLeft="8" />
              ) : (
                <Icon as={FaVolumeUp} marginRight="2" marginLeft="8" />
              )}
            </Flex>
          </Flex>
        ))}
      </Dropdown>

      {audioSelected && (
        <Checkbox
          checked={splitTracks}
          defaultChecked={splitTracks}
          onChange={toggleSplitTracks}
          mt="2"
          colorScheme="red"
          isDisabled={props.disabled}
        >
          <Tooltip label="Split the audio into separated tracks based on silence analysis">
            <Text fontWeight="bold">Split tracks (Beta)</Text>
          </Tooltip>
        </Checkbox>
      )}
    </Flex>
  )
}

export default FormatsDropdown
