import React, { useEffect, useState, useMemo } from 'react'
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
  HStack,
  Progress
} from '@chakra-ui/react'
import { Video } from 'youtube-sr'
import { FaVolumeMute, FaVolumeUp, FaVideoSlash, FaVideo } from 'react-icons/fa'
import ytdl, { videoFormat } from 'ytdl-core'

import Dropdown from './Dropdown'
import LoadingState from '../types/LoadingState'
import { filterBetterFormats } from '../utils'
import { useDownload, useDownloadInfo } from '../contexts/download'

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

  const { download } = useDownload()
  const downloadInfo = useDownloadInfo(video.id!)
  const downloading = useMemo<boolean>(() => !!downloadInfo && !downloadInfo.progress.complete, [downloadInfo])

  useEffect(() => console.log(downloadInfo?.progress), [downloadInfo])

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

  function handleDownload() {
    download(video, formats.data[selected])
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

          {!!downloadInfo && <Progress value={Math.trunc((downloadInfo?.progress.percent || 0) * 100)} colorScheme="red" hasStripe marginTop="2" />}
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          <Dropdown
            w="180px"
            colorScheme="red"
            selected={selected}
            setSelected={setSelected}
            isLoading={formats.loading}
            disabled={downloading}
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
            <Button
              onClick={handleDownload}
              colorScheme="red"
              mr={3}
              disabled={formats.loading || downloading}
            >
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
