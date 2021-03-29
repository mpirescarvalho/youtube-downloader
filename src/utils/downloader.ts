import ytdl, { videoFormat } from 'ytdl-core'
import { Video } from 'youtube-sr'
import path from 'path'
import os from 'os'
import cp from 'child_process'
import pathToFfmpeg from 'ffmpeg-static'
import fs from 'fs'

import { DownloadProgress } from '../contexts/download'

function resolveOutputPath(filename: string, ext: string): string {
  let count = 0
  const getSuffix = () => {
    count++
    if (count > 1) {
      return ` (${count})`
    } else {
      return ''
    }
  }
  const getOutPath = () =>
    path.resolve(outputDir, `${filename}${getSuffix()}.${ext}`)
  const outputDir = path.join(os.homedir(), 'Downloads')
  let outputPath = ''
  do {
    outputPath = getOutPath()
  } while (fs.existsSync(outputPath))
  return outputPath
}

export async function downloadVideo(
  video: Video,
  format: videoFormat,
  progressCallback: (progress: DownloadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPath = resolveOutputPath(video.title || 'video', 'mp4')
    const startTime = Date.now()

    const streamsTracker = {
      audio: { downloaded: 0, total: Infinity },
      video: { downloaded: 0, total: Infinity }
    }

    const currentProgress = {
      complete: false,
      percent: 0,
      downloaded: 0,
      total: 0,
      time: 0,
      timeLeft: 0
    }

    // Tell listeners that download has started
    progressCallback(Object.assign({}, currentProgress))

    const triggerProgress = () => {
      const total = streamsTracker.audio.total + streamsTracker.video.total
      const downloaded =
        streamsTracker.audio.downloaded + streamsTracker.video.downloaded

      const percent = downloaded / total
      const downloadedSeconds = (Date.now() - startTime) / 1000
      const estimatedDownloadTime =
        downloadedSeconds / percent - downloadedSeconds

      Object.assign(currentProgress, {
        complete: percent === 1,
        percent,
        downloaded,
        total,
        time: downloadedSeconds,
        timeLeft: estimatedDownloadTime
      })

      progressCallback(Object.assign({}, currentProgress))
    }

    const videoStream = ytdl(video.url!, { format }).on(
      'progress',
      (_, downloaded, total) => {
        streamsTracker.video = { downloaded, total }
      }
    )

    const audioStream = ytdl(video.url!, { quality: 'highestaudio' }).on(
      'progress',
      (_, downloaded, total) => {
        streamsTracker.audio = { downloaded, total }
      }
    )

    // Start the ffmpeg child process
    const ffmpegProcess = cp.spawn(
      pathToFfmpeg,
      [
        // Remove ffmpeg's console spamming
        '-loglevel',
        '8',
        '-hide_banner',
        // Redirect/Enable progress messages
        '-progress',
        'pipe:3',
        // Set inputs
        '-i',
        'pipe:4',
        '-i',
        'pipe:5',
        // Map audio & video from streams
        '-map',
        '0:a',
        '-map',
        '1:v',
        // Keep encoding
        '-c:v',
        'copy',
        // Define output file
        outputPath
      ],
      {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout, stderr */
          'inherit',
          'inherit',
          'inherit',
          /* Custom: pipe:3, pipe:4, pipe:5 */
          'pipe',
          'pipe',
          'pipe'
        ]
      }
    )

    ffmpegProcess.stdio[3]?.on('data', () => {
      triggerProgress()
    })

    ffmpegProcess.on('close', () => {
      Object.assign(currentProgress, {
        complete: true,
        percent: 1,
        downloaded: currentProgress.total
      })
      progressCallback(Object.assign({}, currentProgress))
      resolve()
    })

    const triggerError = (err: Error) => {
      ffmpegProcess?.kill('SIGINT')
      Object.assign(currentProgress, { error: err.toString() })
      progressCallback(Object.assign({}, currentProgress))
      reject(err)
    }

    audioStream.on('error', triggerError)
    videoStream.on('error', triggerError)

    audioStream.pipe(ffmpegProcess.stdio[4] as any)
    videoStream.pipe(ffmpegProcess.stdio[5 as any] as any)
  })
}

export async function downloadAudio(
  video: Video,
  format: videoFormat,
  progressCallback: (progress: DownloadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPath = resolveOutputPath(video.title || 'audio', 'mp3')
    const startTime = Date.now()

    const currentProgress = {
      complete: false,
      percent: 0,
      downloaded: 0,
      total: 0,
      time: 0,
      timeLeft: 0
    }

    // Tell listeners that download has started
    progressCallback(Object.assign({}, currentProgress))

    const triggerProgress = () => {
      const { downloaded, total } = currentProgress
      const percent = downloaded / total
      const downloadedSeconds = (Date.now() - startTime) / 1000
      const estimatedDownloadTime =
        downloadedSeconds / percent - downloadedSeconds

      Object.assign(currentProgress, {
        complete: percent === 1,
        percent,
        downloaded,
        total,
        time: downloadedSeconds,
        timeLeft: estimatedDownloadTime
      })

      progressCallback(Object.assign({}, currentProgress))
    }

    const audioStream = ytdl(video.url!, { format }).on(
      'progress',
      (_, downloaded, total) => {
        currentProgress.downloaded = downloaded
        currentProgress.total = total
      }
    )

    // Start the ffmpeg child process
    const ffmpegProcess = cp.spawn(
      pathToFfmpeg,
      [
        // Remove ffmpeg's console spamming
        '-loglevel',
        '8',
        '-hide_banner',
        // Redirect/Enable progress messages
        '-progress',
        'pipe:3',
        // Set inputs
        '-i',
        'pipe:4',
        // grap audio only
        '-q:a',
        '0',
        '-map',
        'a',
        // Define output file
        outputPath
      ],
      {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout */
          'inherit',
          'inherit',
          'inherit',
          /* Custom: pipe:3, pipe:4 */
          'pipe',
          'pipe',
          'pipe'
        ]
      }
    )

    ffmpegProcess.stdio[3]?.on('data', () => {
      triggerProgress()
    })

    ffmpegProcess.on('close', () => {
      Object.assign(currentProgress, {
        complete: true,
        percent: 1,
        downloaded: currentProgress.total
      })
      progressCallback(Object.assign({}, currentProgress))
      resolve()
    })

    const triggerError = (err: Error) => {
      ffmpegProcess?.kill('SIGINT')
      Object.assign(currentProgress, { error: err.toString() })
      progressCallback(Object.assign({}, currentProgress))
      reject(err)
    }

    audioStream.on('error', triggerError)
    audioStream.pipe(ffmpegProcess.stdio[4] as any)
  })
}
