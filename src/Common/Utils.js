import fs from 'fs'
import * as path from 'path'

function listFilesRecursively (directory) {
  let fileList = []

  for (const element of directory) {
    const fullPath = path.join(element)
    const stats = fs.statSync(fullPath)
    if (stats.isDirectory()) {
      fileList = fileList.concat(listFilesRecursively(fs.readdirSync(fullPath).map(file => path.join(fullPath, file))))
    } else if (stats.isFile()) {
      fileList.push(fullPath)
    }
  }

  return fileList
}

export { listFilesRecursively }
