import fs from 'fs'
import * as path from 'path'

function listFilesRecursively (directory) {
  let fileList = []

  for (const element of directory) {
    const fullPath = path.join(element).replace(/\\/g, '/')
    const stats = fs.statSync(fullPath)
    if (stats.isDirectory()) {
      fileList = fileList.concat(listFilesRecursively(fs.readdirSync(fullPath).map(file => (path.join(fullPath, file)).replace(/\\/g, '/'))))
    } else if (stats.isFile()) {
      fileList.push(fullPath)
    }
  }

  return fileList
}

function calculateBitrate (bytesDownloaded, downloadTimeSeconds) {
  // Calculate the bitrate in bytes per second
  const bytesPerSecond = bytesDownloaded / downloadTimeSeconds

  // Convert bytes per second to megabytes per second
  const megabytesPerSecond = bytesPerSecond / (1024 ** 2)

  // Choose the appropriate unit based on the bitrate value
  let unit = 'B/s'
  let bitrate = bytesPerSecond
  if (megabytesPerSecond >= 1) {
    unit = 'MB/s'
    bitrate = megabytesPerSecond
  } else if (bytesPerSecond >= 1024) {
    unit = 'KB/s'
    bitrate = bytesPerSecond / 1024
  }

  // Return the calculated bitrate with the appropriate unit, rounded to two decimal places
  return `${bitrate.toFixed(2)} ${unit}`
}

function formatTime (seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds - (hours * 3600)) / 60)
  const remainingSeconds = seconds - (hours * 3600) - (minutes * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toFixed(0).toString().padStart(2, '0')}`
}

export {
  listFilesRecursively,
  calculateBitrate,
  formatTime
}
