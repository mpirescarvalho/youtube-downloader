import React, { useEffect, useState } from 'react'
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
import ytdl, { videoFormat } from 'ytdl-core'

import Dropdown from './Dropdown'
import LoadingState from '../types/LoadingState'
import { filterBetterFormats } from '../utils'

interface DownloadModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
}

const DownloadModal: React.FC<DownloadModalProps> = ({ video, isOpen, onClose }) => {
  const [selected, setSelected] = useState(0)
  const [formats, setFormats] = useState<LoadingState<videoFormat[]>>({
    data: [],
    loading: false
  })

  useEffect(() => {
    if (isOpen && !formats.loading && formats.data.length === 0) {
      loadFormats()
    }
  }, [isOpen, formats])

  async function loadFormats() {
    setFormats({ data: [], loading: true })
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
      const info = await ytdl.getInfo(videoUrl)
      if (isOpen) {
        const data = filterBetterFormats(info.formats)
        console.log(data)
        setFormats({ data, loading: false })
      }
    } catch (err) {
      console.error(err)
    }
  }

  function handleClose() {
    setFormats({ data: [], loading: false })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
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
            isLoading={formats.loading}
          >
            {formats.data.map((format, index) => (
              <Flex key={index} direction="row" justify="space-between">
                <Text>{format.container.toUpperCase()} • {format.qualityLabel}</Text>
                <div>
                  {format.hasVideo ? (
                    <Icon as={FaVideo} marginRight="2" />
                  ) : (
                    <Icon as={FaVideoSlash} marginRight="2" />
                  )}
                  {format.hasAudio ? (
                    <Icon as={FaVolumeUp} />
                  ) : (
                    <Icon as={FaVolumeMute} />
                  )}
                </div>
              </Flex>
            ))}
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
