import { extendTheme, theme } from '@chakra-ui/react'

const customTheme = {
  fonts: {
    body: 'Roboto, system-ui, sans-serif',
    heading: 'Roboto, system-ui, sans-serif',
    mono: 'Menlo, monospace'
  }
}

export default extendTheme(customTheme)
