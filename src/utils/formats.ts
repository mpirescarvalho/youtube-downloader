import ytdl, { chooseFormat, filterFormats, videoFormat } from 'ytdl-core'

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
  )
    .filter((format) => {
      if (!formatsPushed.includes(format.qualityLabel)) {
        formatsPushed.push(format.qualityLabel)
        return true
      }
      return false
    })
    .map((format) => {
      const formatWithExtension = {
        ...format,
        extension: format.container
      } as videoFormat
      return formatWithExtension
    })
  if (audioTrack) {
    audioTrack.extension = 'mp3'
    result.push(audioTrack)
  }
  return result
}

const formatsCache = new Map<string, videoFormat[]>()

export async function fetchVideoFormats(
  videoId: string
): Promise<videoFormat[]> {
  if (formatsCache.has(videoId)) {
    return formatsCache.get(videoId)!
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  const info = await ytdl.getInfo(videoUrl)
  const formats = filterBetterFormats(info.formats)
  formatsCache.set(videoId, formats)
  return formats
}
