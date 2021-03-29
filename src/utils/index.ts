import { chooseFormat, filterFormats, videoFormat } from 'ytdl-core'

export function formatNumberFloat(num: number, digits: number): string {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
}

export function formatNumber(num: number): string {
  const digits = num > 999999 ? 1 : 0
  return formatNumberFloat(num, digits)
}

export function findBestAudioTrack(formats: videoFormat[]): videoFormat | null {
  return chooseFormat(
    filterFormats(formats, (format) => !format.hasVideo && format.hasAudio),
    { quality: 'highestaudio' }
  )
}

export function filterBetterFormats(formats: videoFormat[]): videoFormat[] {
  const audioTrack = findBestAudioTrack(formats)
  const formatsPushed: string[] = []
  const result = filterFormats(
    formats,
    (format) =>
      format.hasVideo && !format.hasAudio && format.container === 'mp4'
  ).filter((format) => {
    if (!formatsPushed.includes(format.qualityLabel)) {
      formatsPushed.push(format.qualityLabel)
      return true
    }
    return false
  })
  if (audioTrack) {
    audioTrack.container = 'mp3' as any
    result.push(audioTrack)
  }
  return result
}
