import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const archivePath = path.join(process.cwd(), 'ilack.tar.gz')
    
    // Check if the archive exists
    try {
      await fs.access(archivePath)
    } catch (error) {
      return NextResponse.json(
        { error: 'Project archive not found' },
        { status: 404 }
      )
    }
    
    // Get file stats
    const stats = await fs.stat(archivePath)
    
    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    return NextResponse.json({
      fileName: 'ilack.tar.gz',
      fileSize: stats.size,
      fileSizeFormatted: formatFileSize(stats.size),
      lastModified: stats.mtime,
      exists: true
    })
  } catch (error) {
    console.error('Project info error:', error)
    return NextResponse.json(
      { error: 'Failed to get project info' },
      { status: 500 }
    )
  }
}