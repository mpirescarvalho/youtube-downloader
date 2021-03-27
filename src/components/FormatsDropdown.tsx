import React from 'react'
import { Flex, Text, Icon } from '@chakra-ui/react'
import { FaVolumeUp, FaVideo } from 'react-icons/fa'

import Dropdown, { DropdownProps } from './Dropdown'
import { videoFormat } from 'ytdl-core'

type FormatsDropdownProps = {
  formats: videoFormat[]
} & DropdownProps

const FormatsDropdown: React.FC<FormatsDropdownProps> = ({ formats, ...props }) => {
  return (
    <Dropdown
      w="180px"
      paddingX="16px"
      colorScheme="red"
      variant="responsive"
      {...props}
    >
      {formats.map((format, index) => (
        <Flex key={index} w="148px" direction="row" justify="space-between" align="center">
          <Text>{format.container.toUpperCase()} • {format.qualityLabel}</Text>
          <div>
            {format.hasVideo
              ? <Icon as={FaVideo} marginRight="2" />
              : <Icon as={FaVolumeUp} marginRight="2" />}
          </div>
        </Flex>
      ))}
    </Dropdown>
  )
}

export default FormatsDropdown
