import React, { useEffect, useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'
import { ipcRenderer } from 'electron'
import { useDownloadingVideos } from '../contexts/download'

const DownloadModal: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const downloads = useDownloadingVideos()

  function onCloseModal() {
    setIsOpen(false)
  }

  function onCloseApp() {
    ipcRenderer.send('closed')
  }

  useEffect(() => {
    function onCloseAppEvent() {
      if (downloads.length > 0) {
        setIsOpen(true)
      } else {
        onCloseApp()
      }
    }
    ipcRenderer.addListener('app-close', onCloseAppEvent)
    return () => {
      ipcRenderer.removeListener('app-close', onCloseAppEvent)
    }
  }, [downloads])

  return (
    <>
      {children}

      <Modal isOpen={isOpen} onClose={onCloseModal} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Downloads in progress</ModalHeader>
          <ModalBody>
            Downloads are currently in progress. Do you want to close and cancel
            the downloads?
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseApp}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={onCloseModal}>
              Wait for downloads
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DownloadModal
