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
    
    // Read the archive file
    const archiveBuffer = await fs.readFile(archivePath)
    
    // Get file stats for content length
    const stats = await fs.stat(archivePath)
    
    // Return the archive as a downloadable file
    return new NextResponse(archiveBuffer, {
      headers: {
        'Content-Type': 'application/text',
        'Content-Disposition': 'attachment; filename="readme.md"',
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download project' },
      { status: 500 }
    )
  }
}
