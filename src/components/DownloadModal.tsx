import React, { useEffect, useRef, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Text,
  Box,
  Icon,
  Flex
} from '@chakra-ui/react'
import { Video } from 'youtube-sr'
import { FaDownload } from 'react-icons/fa'
import ytdl, { videoFormat } from 'ytdl-core'

import FormatsDropdown from './FormatsDropdown'
import LoadingState from '../types/LoadingState'
import { filterBetterFormats } from '../utils'
import { useDownload, useDownloadStatus } from '../contexts/download'
import Progress from './Progress'

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

  const loadingVideo = useRef<string | null>(null)

  const download = useDownload()
  const downloadStatus = useDownloadStatus(video.id!)

  useEffect(() => {
    if (isOpen) {
      setSelected(0)
      loadFormats()
    }
  }, [isOpen])

  async function loadFormats() {
    setFormats({ data: [], loading: true })
    try {
      loadingVideo.current = video.id
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
      const info = await ytdl.getInfo(videoUrl)
      const data = filterBetterFormats(info.formats)
      if (loadingVideo.current === video.id) {
        setFormats({ data, loading: false })
      }
    } catch (err) {
      console.error(err)
    }
  }

  function handleClose() {
    loadingVideo.current = null
    setFormats({ data: [], loading: false })
    onClose()
  }

  async function handleDownload() {
    try {
      await download(video, formats.data[selected])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent background="gray.900" color="gray.100">
        <ModalHeader>
          <Flex direction="row" align="center" justify="flex-start">
            <Icon as={FaDownload} marginRight="3" />
            Download Video
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box position="relative">
            <Image
              src={video.thumbnail.url!}
              fit="cover"
              bgColor="gray.300"
              borderRadius="md"
            />

            <Text
              background="blackAlpha.800"
              fontWeight="bold"
              position="absolute"
              bottom="1"
              right="1"
              fontSize="smaller"
              borderRadius="md"
              paddingX="4px"
              textAlign="center"
            >
              {video.durationFormatted}
            </Text>
          </Box>

          <Text
            flex="1"
            isTruncated noOfLines={1}
            fontWeight="bold"
            marginTop="2"
            textAlign="center"
          >
            {video.title}
          </Text>

          <Progress
            videoId={video.id!}
            marginTop="2"
          />
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          <FormatsDropdown
            formats={formats.data}
            selected={selected}
            setSelected={setSelected}
            isLoading={formats.loading}
            disabled={formats.loading || (downloadStatus !== null)}
          />

          <div>
            <Button
              onClick={handleDownload}
              colorScheme="red"
              mr={3}
              disabled={formats.loading || (downloadStatus !== null)}
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
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DownloadModal
