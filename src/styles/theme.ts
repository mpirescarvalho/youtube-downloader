import { extendTheme } from '@chakra-ui/react'

const customTheme = extendTheme({
  fonts: {
    body: 'Roboto, system-ui, sans-serif',
    heading: 'Roboto, system-ui, sans-serif',
    mono: 'Menlo, monospace'
  },
  components: {
    Popover: {
      variants: {
        responsive: {
          popper: {
            maxWidth: 'unset',
            width: 'unset'
          }
        }
      }
    }
  }
})

export default customTheme
