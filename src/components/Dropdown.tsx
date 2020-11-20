import React, { ReactNodeArray, useState } from 'react'
import {
  Box,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  ButtonProps
} from '@chakra-ui/react'

interface DropdownProps extends ButtonProps {
  isLoading?: boolean
  selected: number
  setSelected(index: number): void
}

const Dropdown: React.FC<DropdownProps> = ({
  isLoading,
  selected,
  setSelected,
  children,
  ...rest
}) => {
  const [open, setOpen] = useState(false)

  function handleSelectOption(index: number) {
    setSelected(index)
    setOpen(false)
  }

  return (
    <Popover
      placement="bottom"
      {...rest}
      isOpen={open}
      onClose={() => setOpen(false)}
    >
      <PopoverTrigger>
        <Button
          onClick={() => setOpen(!open)}
          display="flex"
          isLoading={isLoading}
          {...rest}
        >
          <Box w="100%">{(children as ReactNodeArray)[selected]}</Box>
        </Button>
      </PopoverTrigger>
      <PopoverContent bgColor="gray.800" borderColor="gray.700">
        {(children as ReactNodeArray).map((child, index) => (
          <Button
            _hover={{ backgroundColor: 'gray.600' }}
            _active={{ backgroundColor: 'gray.700' }}
            key={index}
            variant="ghost"
            borderRadius="0"
            onClick={() => handleSelectOption(index)}
          >
            <Box w="100%">{child}</Box>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export default Dropdown
