import { NextRequest, NextResponse } from 'next/server'

// Optional: uncomment if you want to ensure Node.js runtime
// export const runtime = 'nodejs'

const SAMPLE_RATE = 22050

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, voiceName } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Text and voice ID are required' },
        { status: 400 }
      )
    }

    console.log(`Generating TTS for voice: ${voiceName} (${voiceId})`)

    let pcmBuffer: Buffer

    if (voiceId.startsWith('online-')) {
      pcmBuffer = await generateEnhancedTTSAudio(text, voiceName)
    } else {
      pcmBuffer = await generateMockAudio(text, voiceName)
    }

    // Convert PCM to WAV ArrayBuffer (Edge-safe)
    const wavArrayBuffer = pcm16ToWavArrayBuffer(pcmBuffer, SAMPLE_RATE, 1)

    return new NextResponse(wavArrayBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="tts-${Date.now()}.wav"`,
      },
    })
  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      {
        error: `Failed to generate speech: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    )
  }
}

/**
 * Convert PCM16 mono Buffer to WAV ArrayBuffer with proper header
 */
function pcm16ToWavArrayBuffer(
  pcm: Buffer,
  sampleRate: number,
  numChannels = 1
): ArrayBuffer {
  const bytesPerSample = 2 // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = pcm.length
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  let offset = 0

  // RIFF chunk descriptor
  writeString(view, offset, 'RIFF'); offset += 4
  view.setUint32(offset, 36 + dataSize, true); offset += 4
  writeString(view, offset, 'WAVE'); offset += 4

  // fmt subchunk
  writeString(view, offset, 'fmt '); offset += 4
  view.setUint32(offset, 16, true); offset += 4
  view.setUint16(offset, 1, true); offset += 2 // PCM format
  view.setUint16(offset, numChannels, true); offset += 2
  view.setUint32(offset, sampleRate, true); offset += 4
  view.setUint32(offset, byteRate, true); offset += 4
  view.setUint16(offset, blockAlign, true); offset += 2
  view.setUint16(offset, bytesPerSample * 8, true); offset += 2

  // data subchunk
  writeString(view, offset, 'data'); offset += 4
  view.setUint32(offset, dataSize, true); offset += 4

  // PCM samples
  new Uint8Array(buffer, 44).set(pcm)

  return buffer
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

async function generateMockAudio(text: string, voiceName: string): Promise<Buffer> {
  const sampleRate = SAMPLE_RATE
  const duration = Math.min(text.length * 0.1, 30)
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = Buffer.alloc(numSamples * 2) // 16-bit audio

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3
    const intSample = Math.floor(sample * 32767)
    buffer.writeInt16LE(intSample, i * 2)
  }

  return buffer
}

async function generateEnhancedTTSAudio(text: string, voiceName: string): Promise<Buffer> {
  const sampleRate = SAMPLE_RATE
  const duration = Math.min(text.length * 0.1, 30)
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = Buffer.alloc(numSamples * 2)

  let baseFreq = 200
  let formantFreq = 800
  let vibratoRate = 5
  let vibratoDepth = 0.05

  const lower = voiceName.toLowerCase()
  if (lower.includes('emma') || lower.includes('ava')) {
    baseFreq = 250
    formantFreq = 1000
    vibratoRate = 6
    vibratoDepth = 0.08
  } else if (lower.includes('james') || lower.includes('oliver')) {
    baseFreq = 180
    formantFreq = 700
    vibratoRate = 4
    vibratoDepth = 0.04
  }

  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate
    const fundamental = Math.sin(2 * Math.PI * baseFreq * time)
    const formant1 = Math.sin(2 * Math.PI * formantFreq * time) * 0.3
    const formant2 = Math.sin(2 * Math.PI * (formantFreq * 1.5) * time) * 0.2
    const vibrato = Math.sin(2 * Math.PI * vibratoRate * time) * vibratoDepth
    const syllableRate = 2 + Math.sin(time * 0.5) * 0.5
    const amplitude = (Math.sin(2 * Math.PI * syllableRate * time) * 0.5 + 0.5) * 0.8
    const sample = (fundamental + formant1 + formant2) * (1 + vibrato) * amplitude * 0.3
    const noise = (Math.random() - 0.5) * 0.02
    const finalSample = sample + noise

    const intSample = Math.max(-32767, Math.min(32767, Math.floor(finalSample * 32767)))
    buffer.writeInt16LE(intSample, i * 2)
  }

  return buffer
}
