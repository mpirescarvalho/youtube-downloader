import { useRef, useEffect, useState } from 'react'

export default function useVisibility<Element extends HTMLElement>(
  offset = 0
): [boolean, React.RefObject<Element>] {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<Element>()

  const onScroll = () => {
    if (!ref.current) {
      setIsVisible(false)
      return
    }
    const { top, bottom } = ref.current.getBoundingClientRect()
    setIsVisible(top + offset >= 0 && bottom - offset <= window.innerHeight)
  }

  useEffect(() => {
    const scrollContainer = document.querySelector(
      '#scroll-container > div:nth-child(1)'
    )

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', onScroll)
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', onScroll)
      }
    }
  }, [])

  useEffect(() => onScroll())

  return [isVisible, ref as React.RefObject<Element>]
}
