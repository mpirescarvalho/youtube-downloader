import React from 'react'
import { render } from 'react-dom'
import { ChakraProvider, CSSReset, Flex } from '@chakra-ui/react'
import { Titlebar, Color } from 'custom-electron-titlebar'

import theme from './styles/theme'
import icon from './assets/icon.svg'

// eslint-disable-next-line no-new
new Titlebar({
  backgroundColor: Color.fromHex(theme.colors.gray[800]),
  menuPosition: 'bottom',
  titleHorizontalAlignment: 'left',
  menu: null,
  icon
})

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Flex
        h="100%"
        align="center"
        justify="center"
        fontFamily="heading"
        fontSize="46px"
        background="gray.900"
        color="gray.100"
        overflow="hidden"
      >
        Hello Electron
      </Flex>
    </ChakraProvider>
  )
}

render(<App />, document.getElementById('root'))
