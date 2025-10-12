import { NextRequest, NextResponse } from 'next/server'

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
    
    let audioBuffer: Buffer
    
    if (voiceId.startsWith('online-')) {
      // Use enhanced TTS for online voices
      audioBuffer = await generateEnhancedTTSAudio(text, voiceName)
    } else {
      // For local voices, create a simple audio since Web Speech API is browser-only
      audioBuffer = await generateMockAudio(text, voiceName)
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="tts-${Date.now()}.mp3"`,
      },
    })

  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: `Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

async function generateMockAudio(text: string, voiceName: string): Promise<Buffer> {
  // This is a mock implementation
  // In a real application, you would:
  // 1. Use a TTS service like Google Cloud TTS, AWS Polly, or ElevenLabs
  // 2. Or use browser's Web Speech API on the server side (if available)
  // 3. Or integrate with free TTS APIs
  
  // For demonstration, we'll create a simple audio buffer
  // This won't produce actual audio, but shows the structure
  
  const sampleRate = 22050
  const duration = Math.min(text.length * 0.1, 30) // 0.1s per character, max 30s
  const numSamples = Math.floor(sampleRate * duration)
  
  // Create a simple sine wave as placeholder audio
  const buffer = Buffer.alloc(numSamples * 2) // 16-bit audio
  
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3 // 440Hz sine wave
    const intSample = Math.floor(sample * 32767)
    buffer.writeInt16LE(intSample, i * 2)
  }
  
  return buffer
}

async function generateEnhancedTTSAudio(text: string, voiceName: string): Promise<Buffer> {
  // Create a more sophisticated audio generation for "online" voices
  // This simulates different voice characteristics
  
  const sampleRate = 22050
  const duration = Math.min(text.length * 0.1, 30) // 0.1s per character, max 30s
  const numSamples = Math.floor(sampleRate * duration)
  
  const buffer = Buffer.alloc(numSamples * 2) // 16-bit audio
  
  // Define voice characteristics based on voice name
  let baseFreq = 200
  let formantFreq = 800
  let vibratoRate = 5
  let vibratoDepth = 0.05
  
  if (voiceName.toLowerCase().includes('emma') || voiceName.toLowerCase().includes('ava')) {
    baseFreq = 250
    formantFreq = 1000
    vibratoRate = 6
    vibratoDepth = 0.08
  } else if (voiceName.toLowerCase().includes('james') || voiceName.toLowerCase().includes('oliver')) {
    baseFreq = 180
    formantFreq = 700
    vibratoRate = 4
    vibratoDepth = 0.04
  }
  
  // Generate more realistic speech-like audio
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate
    
    // Create speech-like patterns using multiple frequencies
    const fundamental = Math.sin(2 * Math.PI * baseFreq * time)
    const formant1 = Math.sin(2 * Math.PI * formantFreq * time) * 0.3
    const formant2 = Math.sin(2 * Math.PI * (formantFreq * 1.5) * time) * 0.2
    
    // Add vibrato for more natural sound
    const vibrato = Math.sin(2 * Math.PI * vibratoRate * time) * vibratoDepth
    
    // Create amplitude modulation to simulate speech syllables
    const syllableRate = 2 + Math.sin(time * 0.5) * 0.5
    const amplitude = (Math.sin(2 * Math.PI * syllableRate * time) * 0.5 + 0.5) * 0.8
    
    // Combine all components
    const sample = (fundamental + formant1 + formant2) * (1 + vibrato) * amplitude * 0.3
    
    // Add some noise for realism
    const noise = (Math.random() - 0.5) * 0.02
    const finalSample = sample + noise
    
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(finalSample * 32767)))
    buffer.writeInt16LE(intSample, i * 2)
  }
  
  return buffer
}

async function generateEnhancedMockAudio(text: string, voiceName: string): Promise<Buffer> {
  // Create a more realistic mock audio with varying frequencies
  const sampleRate = 22050
  const duration = Math.min(text.length * 0.08, 30) // 0.08s per character, max 30s
  const numSamples = Math.floor(sampleRate * duration)
  
  const buffer = Buffer.alloc(numSamples * 2) // 16-bit audio
  
  // Generate different frequencies based on voice characteristics
  let baseFreq = 200 // Base frequency for male voices
  if (voiceName.toLowerCase().includes('emma') || voiceName.toLowerCase().includes('ava') || voiceName.toLowerCase().includes('karen') || voiceName.toLowerCase().includes('samantha')) {
    baseFreq = 250 // Higher frequency for female voices
  }
  
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate
    // Create a more complex waveform with harmonics
    const fundamental = Math.sin(2 * Math.PI * baseFreq * time)
    const harmonic1 = Math.sin(2 * Math.PI * baseFreq * 2 * time) * 0.3
    const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 3 * time) * 0.1
    
    // Add some modulation to make it sound more like speech
    const modulation = Math.sin(2 * Math.PI * 5 * time) * 0.1
    
    const sample = (fundamental + harmonic1 + harmonic2) * (0.5 + modulation) * 0.3
    const intSample = Math.floor(sample * 32767)
    buffer.writeInt16LE(intSample, i * 2)
  }
  
  return buffer
}