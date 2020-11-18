import React from 'react'
import { render } from 'react-dom'
import { ChakraProvider, CSSReset, Flex } from '@chakra-ui/react'

import theme from './styles/theme'

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Flex
        w="100vw"
        h="100vh"
        align="center"
        justify="center"
        fontFamily="heading"
        fontSize="46px"
        background="gray.900"
        color="gray.100"
      >
        Hello Electron
      </Flex>
    </ChakraProvider>
  )
}

render(<App />, document.getElementById('root'))
