import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import mammoth from 'mammoth'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size)

    // Server-side size check (limit to 10MB)
    const MAX_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum allowed size of 20MB' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Prefer project uploads directory but fall back to OS tmpdir if it's not writable
    const projectUploadsDir = join(process.cwd(), 'uploads')
    let uploadsDir = projectUploadsDir
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
    } catch (err) {
      console.warn('Could not create project uploads dir, falling back to OS temp dir:', err)
      const fallbackDir = join(tmpdir(), 'voice_app_uploads')
      if (!existsSync(fallbackDir)) {
        try {
          await mkdir(fallbackDir, { recursive: true })
        } catch (mkdirErr) {
          console.error('Failed to create fallback temp uploads dir:', mkdirErr)
          // As a last resort, throw the original error so the request fails loudly
          throw err
        }
      }
      uploadsDir = fallbackDir
    }

    // Sanitize original filename (strip paths and unsafe chars)
    const sanitize = (name: string) => {
      // Remove any directory components and keep only base name
      const base = name.replace(/\\|\//g, '')
      // Replace unsafe chars with underscore
      return base.replace(/[^a-zA-Z0-9._-]/g, '_')
    }

    const originalName = sanitize(file.name || 'upload')
    const originalExt = extname(originalName) || ''

    // Use UUID for temp filename to avoid collisions, keep original extension
    const tempFileName = `${randomUUID()}${originalExt}`
    const tempFilePath = join(uploadsDir, tempFileName)

    // Write file inside project uploads dir only
    await writeFile(tempFilePath, buffer)

    // Extract text based on file type
    let extractedText = ''
    const fileType = file.type

    try {
      if (fileType === 'text/plain') {
        // For text files, read directly
        extractedText = buffer.toString('utf-8')
        console.log('Text file processed successfully')
      } else if (fileType === 'application/pdf') {
        // For PDF files - provide a helpful message since PDF parsing is problematic
        console.log('PDF file detected, but PDF parsing is disabled due to technical issues')
        extractedText = `PDF file detected: ${file.name}\n\nWe're currently experiencing technical difficulties with PDF text extraction. Please copy and paste the text from your PDF directly into the text area, or save your PDF as a text file and upload that instead.\n\nWe apologize for the inconvenience.`
      } else if (fileType.includes('word') || fileType.includes('document') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For Word documents
        try {
          extractedText = await extractDocText(tempFilePath)
          console.log('Word document processed successfully')
        } catch (docError) {
          console.error('Word document processing failed:', docError)
          extractedText = `Word document detected: ${file.name}\n\nWe're currently experiencing technical difficulties with Word document text extraction. Please copy and paste the text from your document directly into the text area, or save your document as a text file and upload that instead.\n\nWe apologize for the inconvenience.`
        }
      } else {
        // Try to process as text if unknown type
        extractedText = buffer.toString('utf-8')
        console.log('Unknown file type, processed as text')
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError)
      extractedText = `Failed to extract text from ${file.name}. Error: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`
    }

    // Clean up temporary file
    try {
      await unlink(tempFilePath)
    } catch (error) {
      console.error('Error cleaning up temp file:', error)
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      extractedText: extractedText.substring(0, 10000), // Limit to 10k characters
      fileName: file.name,
      fileType,
      success: true
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

async function extractDocText(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  } catch (error) {
    console.error('Word document extraction error:', error)
    return 'Failed to extract text from Word document. The file might be corrupted or in an unsupported format.'
  }
}