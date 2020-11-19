import { extendTheme } from '@chakra-ui/react'

const customTheme = extendTheme({
  fonts: {
    body: 'Roboto, system-ui, sans-serif',
    heading: 'Roboto, system-ui, sans-serif',
    mono: 'Menlo, monospace'
  }
})

export default customTheme
