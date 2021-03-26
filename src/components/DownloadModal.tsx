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
  Image,
  Text,
  useToast,
  Box
} from '@chakra-ui/react'
import { Video } from 'youtube-sr'
import ytdl, { videoFormat } from 'ytdl-core'

import FormatsDropdown from './FormatsDropdown'
import LoadingState from '../types/LoadingState'
import { filterBetterFormats } from '../utils'
import { useDownload, useIsDownloading } from '../contexts/download'
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

  const download = useDownload()
  const isDownloading = useIsDownloading(video.id!)
  const toast = useToast()

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

  async function handleDownload() {
    try {
      await download(video, formats.data[selected])
      toast({
        title: 'Download finished',
        description: video.title,
        status: 'success',
        duration: 4000,
        isClosable: true
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent background="gray.900" color="gray.100">
        <ModalHeader>Download Video</ModalHeader>
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
            disabled={formats.loading || isDownloading}
          />

          <div>
            <Button
              onClick={handleDownload}
              colorScheme="red"
              mr={3}
              disabled={formats.loading || isDownloading}
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