/* eslint-disable @typescript-eslint/no-explicit-any */
import ytdl, { downloadOptions, videoFormat } from 'ytdl-core'
import path from 'path'
import os from 'os'
import cp from 'child_process'
import ffmpegStatic from 'ffmpeg-static'
import fs from 'fs'
import { DownloadProgress, DownloadStatus } from '../contexts/download'
import DownloadAbortError from '../errors/DownloadAbortError'
import Video from '../types/Video'
import * as AudioSplitter from 'audio-splitter'

export class DownloadController {
  pause(): void {
    /* do nothing */
  }

  resume(): void {
    /* do nothing */
  }

  stop(): void {
    /* do nothing */
  }
}

export type DownloadParams = {
  video: Video
  format?: videoFormat
  audioOnly?: boolean
  splitTracks?: boolean
  controller?: DownloadController
  progressCallback?: (progress: DownloadProgress) => void
}

let FFMPEG_PATH: string

if (process.env.NODE_ENV === 'production') {
  FFMPEG_PATH = path.resolve(
    process.resourcesPath,
    'app.asar.unpacked',
    ffmpegStatic
  )
} else {
  FFMPEG_PATH = ffmpegStatic
}

async function clearFile(filename: string) {
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename)
  }
}

function resolveOutputPath(filename: string, ext?: string): string {
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
    path.resolve(outputDir, `${filename}${getSuffix()}${ext ? `.${ext}` : '/'}`)
  const outputDir = path.join(os.homedir(), 'Downloads')
  let outputPath = ''
  do {
    outputPath = getOutPath()
  } while (fs.existsSync(outputPath))
  if (!ext) {
    fs.mkdirSync(outputPath)
  }
  return outputPath + (ext ? '' : '/')
}

async function downloadVideo({
  video,
  format,
  controller,
  progressCallback
}: Omit<DownloadParams, 'audioOnly'>): Promise<void> {
  return new Promise((resolve, reject) => {
    const currentProgress: DownloadProgress = {
      status: 'starting',
      percent: 0,
      downloaded: 0,
      total: 0,
      time: 0,
      timeLeft: 0
    }

    // Tell listeners that download has started
    progressCallback?.(Object.assign({}, currentProgress))

    let outputPath = ''

    try {
      outputPath = resolveOutputPath(video.title || 'video', 'mp4')
      const startTime = Date.now()

      const streamsTracker = {
        audio: { downloaded: 0, total: Infinity },
        video: { downloaded: 0, total: Infinity }
      }

      const triggerProgress = () => {
        const total = streamsTracker.audio.total + streamsTracker.video.total
        const downloaded =
          streamsTracker.audio.downloaded + streamsTracker.video.downloaded

        const percent = downloaded / total
        const downloadedSeconds = (Date.now() - startTime) / 1000
        const estimatedDownloadTime =
          downloadedSeconds / percent - downloadedSeconds

        const status = percent === 1 ? 'finished' : 'downloading'

        Object.assign(currentProgress, {
          status,
          percent,
          downloaded,
          total,
          time: downloadedSeconds,
          timeLeft: estimatedDownloadTime
        })

        progressCallback?.(Object.assign({}, currentProgress))
      }

      const options: downloadOptions = {}
      if (format) {
        options.format = format
      } else {
        options.quality = 'highestvideo'
      }

      const videoStream = ytdl(video.url, options).on(
        'progress',
        (_, downloaded, total) => {
          streamsTracker.video = { downloaded, total }
        }
      )

      const audioStream = ytdl(video.url, { quality: 'highestaudio' }).on(
        'progress',
        (_, downloaded, total) => {
          streamsTracker.audio = { downloaded, total }
        }
      )

      // Start the ffmpeg child process
      const ffmpegProcess = cp.spawn(
        FFMPEG_PATH,
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

      ffmpegProcess.stdio[3]!.on('data', () => {
        triggerProgress()
      })

      ffmpegProcess.on('close', (statusCode) => {
        if (statusCode === 0) {
          Object.assign(currentProgress, {
            status: 'finished',
            percent: 1,
            downloaded: currentProgress.total
          })
          progressCallback?.(Object.assign({}, currentProgress))
          resolve()
        }
      })

      const triggerError = (err: Error) => {
        ffmpegProcess.kill('SIGINT')
        Object.assign(currentProgress, {
          status: 'failed',
          error: err.toString()
        })
        progressCallback?.(Object.assign({}, currentProgress))
        clearFile(outputPath)
        reject(err)
      }

      audioStream.on('error', triggerError)
      videoStream.on('error', triggerError)

      audioStream.pipe(ffmpegProcess.stdio[4] as any)
      videoStream.pipe(ffmpegProcess.stdio[5 as any] as any)

      if (controller) {
        controller.pause = () => {
          audioStream.pause()
          videoStream.pause()
          currentProgress.status = 'paused'
          progressCallback?.(Object.assign({}, currentProgress))
        }

        controller.resume = () => {
          audioStream.resume()
          videoStream.resume()
          currentProgress.status = 'downloading'
          progressCallback?.(Object.assign({}, currentProgress))
        }

        controller.stop = () => {
          audioStream.destroy()
          videoStream.destroy()
          ffmpegProcess.kill('SIGINT')
          currentProgress.status = 'stopped'
          currentProgress.error = new DownloadAbortError().message
          progressCallback?.(Object.assign({}, currentProgress))
          clearFile(outputPath)
          reject(new DownloadAbortError())
        }
      }
    } catch (err) {
      Object.assign(currentProgress, {
        status: 'failed',
        error: err.toString()
      })
      progressCallback?.(Object.assign({}, currentProgress))
      clearFile(outputPath)
      reject(err)
    }
  })
}

async function downloadAudio({
  video,
  format,
  controller,
  splitTracks,
  progressCallback
}: Omit<DownloadParams, 'audioOnly'>): Promise<void> {
  return new Promise((resolve, reject) => {
    const currentProgress: DownloadProgress = {
      status: 'starting',
      percent: 0,
      downloaded: 0,
      total: 0,
      time: 0,
      timeLeft: 0
    }

    // Tell listeners that download has started
    progressCallback?.(Object.assign({}, currentProgress))

    let outputPath = ''

    try {
      outputPath = resolveOutputPath(video.title || 'audio', 'mp3')
      const startTime = Date.now()

      const triggerProgress = () => {
        const { downloaded, total, status } = currentProgress
        if (['finished', 'processing', 'failed', 'stopped'].includes(status)) {
          return
        }
        const percent = downloaded / total
        const downloadedSeconds = (Date.now() - startTime) / 1000
        const estimatedDownloadTime =
          downloadedSeconds / percent - downloadedSeconds

        Object.assign(currentProgress, {
          status: 'downloading',
          percent,
          downloaded,
          total,
          time: downloadedSeconds,
          timeLeft: estimatedDownloadTime
        })

        progressCallback?.(Object.assign({}, currentProgress))
      }

      const options: downloadOptions = {}
      if (format) {
        options.format = format
      } else {
        options.quality = 'highestaudio'
      }

      const audioStream = ytdl(video.url, options).on(
        'progress',
        (_, downloaded, total) => {
          currentProgress.downloaded = downloaded
          currentProgress.total = total
        }
      )

      // Start the ffmpeg child process
      const ffmpegProcess = cp.spawn(
        FFMPEG_PATH,
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

      ffmpegProcess.stdio[3]!.on('data', () => {
        triggerProgress()
      })

      ffmpegProcess.on('close', (statusCode) => {
        if (statusCode === 0) {
          if (splitTracks) {
            if (controller) {
              controller.pause = () => {
                // remove pause action
              }
              controller.stop = () => {
                // remove stop action
              }
              controller.resume = () => {
                // remove resume action
              }
            }

            Object.assign(currentProgress, {
              status: 'processing',
              percent: 1,
              downloaded: currentProgress.total
            })
            progressCallback?.(Object.assign({}, currentProgress))

            const pathFile = path.parse(outputPath)
            pathFile.name = pathFile.name + '-temp'
            pathFile.base = pathFile.name + pathFile.ext
            const tempOutputPath = path.format(pathFile)

            const outputDir = resolveOutputPath(video.title)

            try {
              fs.renameSync(outputPath, tempOutputPath)

              AudioSplitter.splitAudio({
                ffmpegPath: FFMPEG_PATH,
                mergedTrack: tempOutputPath,
                outputDir: outputDir,
                minSilenceLength: 0.01,
                maxNoiseLevel: -40,
                minSongLength: 40
              })
            } catch (err) {
              fs.rmdirSync(outputDir)
              return triggerError(err)
            } finally {
              clearFile(outputPath)
              clearFile(tempOutputPath)
            }
          }

          Object.assign(currentProgress, {
            status: 'finished',
            percent: 1,
            downloaded: currentProgress.total
          })
          progressCallback?.(Object.assign({}, currentProgress))
          resolve()
        }
      })

      const triggerError = (err: Error) => {
        ffmpegProcess.kill('SIGINT')
        Object.assign(currentProgress, {
          status: 'failed',
          error: err.toString()
        })
        progressCallback?.(Object.assign({}, currentProgress))
        clearFile(outputPath)
        reject(err)
      }

      audioStream.on('error', triggerError)
      audioStream.pipe(ffmpegProcess.stdio[4] as any)

      if (controller) {
        controller.pause = () => {
          audioStream.pause()
          currentProgress.status = 'paused'
          progressCallback?.(Object.assign({}, currentProgress))
        }

        controller.resume = () => {
          audioStream.resume()
          currentProgress.status = 'downloading'
          progressCallback?.(Object.assign({}, currentProgress))
        }

        controller.stop = () => {
          audioStream.destroy()
          ffmpegProcess.kill('SIGINT')
          currentProgress.status = 'stopped'
          currentProgress.error = new DownloadAbortError().message
          progressCallback?.(Object.assign({}, currentProgress))
          clearFile(outputPath)
          reject(new DownloadAbortError())
        }
      }
    } catch (err) {
      Object.assign(currentProgress, {
        status: 'failed',
        error: err.toString()
      })
      progressCallback?.(Object.assign({}, currentProgress))
      clearFile(outputPath)
      reject(err)
    }
  })
}

async function doDownload(params: DownloadParams) {
  if (params.audioOnly) {
    return await downloadAudio({ ...params })
  } else {
    return await downloadVideo({ ...params })
  }
}

type QueueItem = {
  params: DownloadParams
  status: DownloadStatus
  order: number
}

const queue: Record<string, QueueItem> = {}

function cleanupQueue() {
  Object.keys(queue).forEach((key) => {
    if (['finished', 'stopped', 'failed'].includes(queue[key].status)) {
      delete queue[key]
    }
  })
}

async function checkQueue() {
  cleanupQueue()

  const downloading = Object.values(queue).filter(
    (item) => item.status !== 'queue'
  )

  const enqueued = Object.values(queue)
    .filter((item) => item.status === 'queue')
    .sort((a, b) => a.order - b.order)

  // 3 concurrent downloads is the maximum
  if (downloading.length >= 3) {
    return
  }

  // there's no downloads waiting
  if (enqueued.length === 0) {
    return
  }

  const nextDownload = enqueued.shift()!

  queue[nextDownload!.params.video.id!].status = 'starting'
  // eslint-disable-next-line handle-callback-err
  doDownload(nextDownload.params).catch(() => {
    // do nothing
  })
}

setInterval(checkQueue, 150)

export async function queueDownload(params: DownloadParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const internalCallback: typeof params.progressCallback = (progress) => {
      params.progressCallback?.(progress)
      if (queue[params.video.id!]) {
        if (
          !['finished', 'stopped', 'failed'].includes(
            queue[params.video.id!].status
          )
        ) {
          queue[params.video.id!].status = progress.status
        }
      }
      if (progress.status === 'finished') {
        resolve()
      } else if (progress.status === 'stopped') {
        reject(new DownloadAbortError())
      } else if (progress.status === 'failed') {
        reject(new Error(progress.error))
      }
    }

    if (params.controller) {
      params.controller.stop = () => {
        queue[params.video.id!].status = 'stopped'
        reject(new DownloadAbortError())
      }
    }

    params.progressCallback?.({
      status: 'queue',
      percent: 0,
      downloaded: 0,
      total: 0,
      time: 0,
      timeLeft: 0
    })

    queue[params.video.id!] = {
      order: Object.keys(queue).length + 1,
      params: {
        ...params,
        progressCallback: internalCallback
      },
      status: 'queue'
    }
  })
}
