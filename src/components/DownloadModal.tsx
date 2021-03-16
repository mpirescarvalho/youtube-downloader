import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Image,
  Text,
  Icon,
  HStack
} from '@chakra-ui/react'
import { Video } from 'youtube-sr'
import { FaVolumeMute, FaVolumeUp, FaVideoSlash, FaVideo } from 'react-icons/fa'

import Dropdown from './Dropdown'

interface DownloadModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
}

const DownloadModal: React.FC<DownloadModalProps> = ({ video, isOpen, onClose }) => {
  const [selected, setSelected] = useState(0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent background="gray.900" color="gray.100">
        <ModalHeader>Download Video</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <Image
              src={video.thumbnail.url!}
              fit="cover"
              bgColor="gray.300"
              borderRadius="md"
            />
          </Flex>

          <Text
            flex="1"
            isTruncated noOfLines={1}
            fontWeight="bold"
            marginTop="2"
            textAlign="center"
          >
            {video.title}
          </Text>
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          <Dropdown
            w="180px"
            colorScheme="red"
            selected={selected}
            setSelected={setSelected}
            isLoading={false}
          >

            <Flex direction="row" justify="space-between">
              <Text>320p mp3</Text>
              <div>
                <Icon as={FaVideoSlash} marginRight="2" />
                <Icon as={FaVolumeUp} />
              </div>
            </Flex>

            <Flex direction="row" justify="space-between">
              <Text>720p mp4</Text>
              <div>
                <Icon as={FaVideo} marginRight="2" />
                <Icon as={FaVolumeMute} />
              </div>
            </Flex>

            <Flex direction="row" justify="space-between">
              <Text>1080p mp4</Text>
              <div>
                <Icon as={FaVideo} marginRight="2" />
                <Icon as={FaVolumeUp} />
              </div>
            </Flex>
          </Dropdown>

          <div>
            <Button colorScheme="red" mr={3}>
              Download
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              _hover={{
                background: 'gray.100',
                color: 'gray.700'
              }}
            >
              Cancel
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DownloadModal
